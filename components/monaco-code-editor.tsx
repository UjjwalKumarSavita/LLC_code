"use client";

import dynamic from "next/dynamic";
import {
  useCallback,
  useEffect,
  useRef,
  useState,
  useSyncExternalStore,
} from "react";
import type { BeforeMount, OnMount } from "@monaco-editor/react";
import type { editor } from "monaco-editor";
import type { Language } from "@/lib/problem-types";

const MonacoEditor = dynamic(
  () => import("@monaco-editor/react").then((module) => module.default),
  {
    ssr: false,
    loading: () => (
      <div className="monaco-editor-loading" role="status">
        <span />
        Loading editor…
      </div>
    ),
  },
);

export type EditorSettings = {
  fontSize: number;
  minimap: boolean;
  tabSize: 2 | 4;
  wordWrap: boolean;
};

const languageIds: Record<Language, string> = {
  "Python 3": "python",
  JavaScript: "javascript",
  "C++": "cpp",
  Java: "java",
};

function subscribeToTheme(callback: () => void) {
  const observer = new MutationObserver(callback);
  observer.observe(document.documentElement, {
    attributeFilter: ["data-theme"],
    attributes: true,
  });
  return () => observer.disconnect();
}

function getThemeSnapshot() {
  return document.documentElement.dataset.theme === "light" ? "light" : "dark";
}

function getServerThemeSnapshot() {
  return "dark";
}

export function MonacoCodeEditor({
  language,
  onChange,
  onRun,
  onSubmit,
  settings,
  value,
}: {
  language: Language;
  onChange: (value: string) => void;
  onRun: () => void;
  onSubmit: () => void;
  settings: EditorSettings;
  value: string;
}) {
  const theme = useSyncExternalStore(
    subscribeToTheme,
    getThemeSnapshot,
    getServerThemeSnapshot,
  );
  const runRef = useRef(onRun);
  const submitRef = useRef(onSubmit);
  const [editorMounted, setEditorMounted] = useState(false);
  const [useBasicEditor, setUseBasicEditor] = useState(false);

  useEffect(() => {
    runRef.current = onRun;
    submitRef.current = onSubmit;
  }, [onRun, onSubmit]);

  useEffect(() => {
    if (editorMounted) return;
    const timeout = window.setTimeout(() => setUseBasicEditor(true), 4_000);
    return () => window.clearTimeout(timeout);
  }, [editorMounted]);

  const defineThemes: BeforeMount = useCallback((monaco) => {
    monaco.editor.defineTheme("llc-code-dark", {
      base: "vs-dark",
      inherit: true,
      rules: [
        { token: "", foreground: "FFFFFF", background: "000000" },
        { token: "comment", foreground: "858585", fontStyle: "italic" },
        { token: "string", foreground: "FFFFFF" },
        { token: "number", foreground: "D8D8D8" },
        { token: "keyword", foreground: "FFFFFF", fontStyle: "bold" },
      ],
      colors: {
        "editor.background": "#000000",
        "editor.foreground": "#FFFFFF",
        "editor.lineHighlightBackground": "#0A0A0A",
        "editor.lineHighlightBorder": "#242424",
        "editor.selectionBackground": "#FFFFFF35",
        "editor.inactiveSelectionBackground": "#FFFFFF20",
        "editorCursor.foreground": "#FFFFFF",
        "editorLineNumber.foreground": "#5F5F5F",
        "editorLineNumber.activeForeground": "#FFFFFF",
        "editorIndentGuide.background1": "#1B1B1B",
        "editorIndentGuide.activeBackground1": "#555555",
        "editorBracketMatch.background": "#FFFFFF18",
        "editorBracketMatch.border": "#FFFFFF",
        "editorWidget.background": "#050505",
        "editorWidget.border": "#333333",
        "editorSuggestWidget.background": "#050505",
        "editorSuggestWidget.border": "#333333",
        "editorSuggestWidget.selectedBackground": "#202020",
        "minimap.background": "#000000",
        "scrollbarSlider.background": "#FFFFFF24",
        "scrollbarSlider.hoverBackground": "#FFFFFF40",
        "scrollbarSlider.activeBackground": "#FFFFFF55",
      },
    });

    monaco.editor.defineTheme("llc-code-light", {
      base: "vs",
      inherit: true,
      rules: [
        { token: "", foreground: "000000", background: "FFFFFF" },
        { token: "comment", foreground: "737373", fontStyle: "italic" },
        { token: "string", foreground: "000000" },
        { token: "number", foreground: "303030" },
        { token: "keyword", foreground: "000000", fontStyle: "bold" },
      ],
      colors: {
        "editor.background": "#FFFFFF",
        "editor.foreground": "#000000",
        "editor.lineHighlightBackground": "#F7F7F7",
        "editor.lineHighlightBorder": "#D8D8D8",
        "editor.selectionBackground": "#00000024",
        "editor.inactiveSelectionBackground": "#00000016",
        "editorCursor.foreground": "#000000",
        "editorLineNumber.foreground": "#9A9A9A",
        "editorLineNumber.activeForeground": "#000000",
        "editorIndentGuide.background1": "#E6E6E6",
        "editorIndentGuide.activeBackground1": "#9A9A9A",
        "editorBracketMatch.background": "#00000010",
        "editorBracketMatch.border": "#000000",
        "editorWidget.background": "#FFFFFF",
        "editorWidget.border": "#CCCCCC",
        "editorSuggestWidget.background": "#FFFFFF",
        "editorSuggestWidget.border": "#CCCCCC",
        "editorSuggestWidget.selectedBackground": "#E8E8E8",
        "minimap.background": "#FFFFFF",
        "scrollbarSlider.background": "#00000020",
        "scrollbarSlider.hoverBackground": "#00000038",
        "scrollbarSlider.activeBackground": "#00000050",
      },
    });
  }, []);

  const handleMount: OnMount = useCallback((mountedEditor, monaco) => {
    setEditorMounted(true);
    mountedEditor.addCommand(
      monaco.KeyMod.CtrlCmd | monaco.KeyCode.Enter,
      () => runRef.current(),
    );
    mountedEditor.addCommand(
      monaco.KeyMod.CtrlCmd | monaco.KeyMod.Shift | monaco.KeyCode.Enter,
      () => submitRef.current(),
    );
    mountedEditor.focus();
  }, []);

  const options: editor.IStandaloneEditorConstructionOptions = {
    accessibilitySupport: "auto",
    ariaLabel: "Code editor",
    automaticLayout: true,
    bracketPairColorization: { enabled: true },
    cursorBlinking: "smooth",
    cursorSmoothCaretAnimation: "on",
    fontFamily: "'JetBrains Mono', 'Cascadia Code', Consolas, monospace",
    fontLigatures: true,
    fontSize: settings.fontSize,
    formatOnPaste: true,
    guides: {
      bracketPairs: true,
      indentation: true,
    },
    insertSpaces: true,
    lineHeight: Math.round(settings.fontSize * 1.7),
    minimap: {
      enabled: settings.minimap,
      maxColumn: 80,
      renderCharacters: false,
      scale: 1,
      showSlider: "mouseover",
    },
    mouseWheelZoom: true,
    padding: { bottom: 18, top: 18 },
    renderLineHighlight: "all",
    roundedSelection: false,
    scrollBeyondLastLine: false,
    smoothScrolling: true,
    tabSize: settings.tabSize,
    wordWrap: settings.wordWrap ? "on" : "off",
  };

  return (
    <div className="monaco-editor-shell">
      {useBasicEditor ? (
        <textarea
          aria-label="Code editor"
          className="basic-code-editor"
          onChange={(event) => onChange(event.target.value)}
          onKeyDown={(event) => {
            if (!(event.ctrlKey || event.metaKey) || event.key !== "Enter") return;
            event.preventDefault();
            if (event.shiftKey) onSubmit();
            else onRun();
          }}
          spellCheck={false}
          value={value}
        />
      ) : (
        <MonacoEditor
          beforeMount={defineThemes}
          language={languageIds[language]}
          onChange={(nextValue) => onChange(nextValue ?? "")}
          onMount={handleMount}
          options={options}
          path={`llc-code://${languageIds[language]}/solution`}
          theme={theme === "light" ? "llc-code-light" : "llc-code-dark"}
          value={value}
        />
      )}
    </div>
  );
}
