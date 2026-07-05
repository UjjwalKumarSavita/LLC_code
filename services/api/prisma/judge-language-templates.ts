export type ExtraLanguage = "javascript" | "cpp" | "java";

export const judgeLanguageTemplates: Record<
  string,
  Record<ExtraLanguage, string>
> = {
  "valid-parentheses": {
    javascript: `const fs = require("fs");
const s = fs.readFileSync(0, "utf8").trim();
const stack = [];
const pairs = {")": "(", "]": "[", "}": "{"};
let valid = true;
for (const char of s) {
  if ("([{".includes(char)) stack.push(char);
  else if (!stack.length || stack.pop() !== pairs[char]) {
    valid = false;
    break;
  }
}
console.log(valid && stack.length === 0 ? "true" : "false");`,
    cpp: `#include <iostream>
#include <stack>
#include <string>
#include <unordered_map>
using namespace std;
int main() {
    string s; cin >> s;
    stack<char> opened;
    unordered_map<char, char> pairs = {{')','('}, {']','['}, {'}','{'}};
    for (char c : s) {
        if (c == '(' || c == '[' || c == '{') opened.push(c);
        else if (opened.empty() || opened.top() != pairs[c]) {
            cout << "false\\n"; return 0;
        } else opened.pop();
    }
    cout << (opened.empty() ? "true" : "false") << '\\n';
}`,
    java: `import java.util.*;
class Main {
    public static void main(String[] args) {
        Scanner input = new Scanner(System.in);
        String s = input.next();
        Deque<Character> stack = new ArrayDeque<>();
        Map<Character, Character> pairs = Map.of(')', '(', ']', '[', '}', '{');
        for (char c : s.toCharArray()) {
            if (c == '(' || c == '[' || c == '{') stack.push(c);
            else if (stack.isEmpty() || stack.pop() != pairs.get(c)) {
                System.out.println("false"); return;
            }
        }
        System.out.println(stack.isEmpty() ? "true" : "false");
    }
}`
  },
  "binary-search": {
    javascript: `const values = require("fs").readFileSync(0, "utf8").trim().split(/\\s+/).map(Number);
const [target, ...nums] = values;
let left = 0, right = nums.length - 1, answer = -1;
while (left <= right) {
  const middle = Math.floor((left + right) / 2);
  if (nums[middle] === target) { answer = middle; break; }
  if (nums[middle] < target) left = middle + 1;
  else right = middle - 1;
}
console.log(answer);`,
    cpp: `#include <iostream>
#include <vector>
using namespace std;
int main() {
    int target, value; cin >> target;
    vector<int> nums; while (cin >> value) nums.push_back(value);
    int left = 0, right = (int)nums.size() - 1;
    while (left <= right) {
        int middle = left + (right - left) / 2;
        if (nums[middle] == target) { cout << middle << '\\n'; return 0; }
        if (nums[middle] < target) left = middle + 1;
        else right = middle - 1;
    }
    cout << -1 << '\\n';
}`,
    java: `import java.util.*;
class Main {
    public static void main(String[] args) {
        Scanner input = new Scanner(System.in);
        int target = input.nextInt();
        List<Integer> values = new ArrayList<>();
        while (input.hasNextInt()) values.add(input.nextInt());
        int left = 0, right = values.size() - 1;
        while (left <= right) {
            int middle = left + (right - left) / 2;
            if (values.get(middle) == target) {
                System.out.println(middle); return;
            }
            if (values.get(middle) < target) left = middle + 1;
            else right = middle - 1;
        }
        System.out.println(-1);
    }
}`
  },
  "maximum-subarray": {
    javascript: `const nums = require("fs").readFileSync(0, "utf8").trim().split(/\\s+/).map(Number);
let current = nums[0], best = nums[0];
for (let i = 1; i < nums.length; i++) {
  current = Math.max(nums[i], current + nums[i]);
  best = Math.max(best, current);
}
console.log(best);`,
    cpp: `#include <algorithm>
#include <iostream>
#include <vector>
using namespace std;
int main() {
    long long value; vector<long long> nums;
    while (cin >> value) nums.push_back(value);
    long long current = nums[0], best = nums[0];
    for (size_t i = 1; i < nums.size(); ++i) {
        current = max(nums[i], current + nums[i]);
        best = max(best, current);
    }
    cout << best << '\\n';
}`,
    java: `import java.util.*;
class Main {
    public static void main(String[] args) {
        Scanner input = new Scanner(System.in);
        long current = input.nextLong(), best = current;
        while (input.hasNextLong()) {
            long value = input.nextLong();
            current = Math.max(value, current + value);
            best = Math.max(best, current);
        }
        System.out.println(best);
    }
}`
  },
  "level-order-traversal": {
    javascript: `const tokens = require("fs").readFileSync(0, "utf8").trim().split(/\\s+/);
if (!tokens.length || tokens[0] === "null") process.exit(0);
const root = {value: Number(tokens[0]), left: null, right: null};
const build = [root];
let index = 1, cursor = 0;
while (cursor < build.length && index < tokens.length) {
  const node = build[cursor++];
  for (const side of ["left", "right"]) {
    if (index >= tokens.length) break;
    const token = tokens[index++];
    if (token !== "null") {
      node[side] = {value: Number(token), left: null, right: null};
      build.push(node[side]);
    }
  }
}
let queue = [root];
const lines = [];
while (queue.length) {
  const next = [], level = [];
  for (const node of queue) {
    level.push(node.value);
    if (node.left) next.push(node.left);
    if (node.right) next.push(node.right);
  }
  lines.push(level.join(" "));
  queue = next;
}
console.log(lines.join("\\n"));`,
    cpp: `#include <iostream>
#include <queue>
#include <sstream>
#include <string>
#include <vector>
using namespace std;
struct Node { int value; Node *left = nullptr, *right = nullptr; };
int main() {
    vector<string> tokens; string token;
    while (cin >> token) tokens.push_back(token);
    if (tokens.empty() || tokens[0] == "null") return 0;
    Node* root = new Node{stoi(tokens[0])};
    queue<Node*> build; build.push(root);
    size_t index = 1;
    while (!build.empty() && index < tokens.size()) {
        Node* node = build.front(); build.pop();
        if (index < tokens.size() && tokens[index] != "null") {
            node->left = new Node{stoi(tokens[index])}; build.push(node->left);
        }
        ++index;
        if (index < tokens.size() && tokens[index] != "null") {
            node->right = new Node{stoi(tokens[index])}; build.push(node->right);
        }
        ++index;
    }
    queue<Node*> nodes; nodes.push(root);
    bool firstLine = true;
    while (!nodes.empty()) {
        int count = nodes.size();
        if (!firstLine) cout << '\\n';
        firstLine = false;
        for (int i = 0; i < count; ++i) {
            Node* node = nodes.front(); nodes.pop();
            if (i) cout << ' ';
            cout << node->value;
            if (node->left) nodes.push(node->left);
            if (node->right) nodes.push(node->right);
        }
    }
}`,
    java: `import java.util.*;
class Main {
    static class Node {
        int value; Node left, right;
        Node(int value) { this.value = value; }
    }
    public static void main(String[] args) {
        Scanner input = new Scanner(System.in);
        List<String> tokens = new ArrayList<>();
        while (input.hasNext()) tokens.add(input.next());
        if (tokens.isEmpty() || tokens.get(0).equals("null")) return;
        Node root = new Node(Integer.parseInt(tokens.get(0)));
        Queue<Node> build = new ArrayDeque<>(); build.add(root);
        int index = 1;
        while (!build.isEmpty() && index < tokens.size()) {
            Node node = build.remove();
            if (index < tokens.size() && !tokens.get(index).equals("null")) {
                node.left = new Node(Integer.parseInt(tokens.get(index)));
                build.add(node.left);
            }
            index++;
            if (index < tokens.size() && !tokens.get(index).equals("null")) {
                node.right = new Node(Integer.parseInt(tokens.get(index)));
                build.add(node.right);
            }
            index++;
        }
        Queue<Node> queue = new ArrayDeque<>(); queue.add(root);
        List<String> lines = new ArrayList<>();
        while (!queue.isEmpty()) {
            int count = queue.size();
            List<String> level = new ArrayList<>();
            for (int i = 0; i < count; i++) {
                Node node = queue.remove();
                level.add(String.valueOf(node.value));
                if (node.left != null) queue.add(node.left);
                if (node.right != null) queue.add(node.right);
            }
            lines.add(String.join(" ", level));
        }
        System.out.print(String.join("\\n", lines));
    }
}`
  },
  "longest-substring": {
    javascript: `let s = require("fs").readFileSync(0, "utf8");
if (s.endsWith("\\n")) s = s.slice(0, -1);
const last = new Map();
let left = 0, best = 0;
for (let right = 0; right < s.length; right++) {
  const char = s[right];
  if (last.has(char) && last.get(char) >= left) left = last.get(char) + 1;
  last.set(char, right);
  best = Math.max(best, right - left + 1);
}
console.log(best);`,
    cpp: `#include <algorithm>
#include <iostream>
#include <string>
#include <unordered_map>
using namespace std;
int main() {
    string s; getline(cin, s);
    unordered_map<char, int> last;
    int left = 0, best = 0;
    for (int right = 0; right < (int)s.size(); ++right) {
        char c = s[right];
        if (last.count(c) && last[c] >= left) left = last[c] + 1;
        last[c] = right;
        best = max(best, right - left + 1);
    }
    cout << best << '\\n';
}`,
    java: `import java.io.*;
import java.util.*;
class Main {
    public static void main(String[] args) throws Exception {
        String s = new BufferedReader(new InputStreamReader(System.in)).readLine();
        if (s == null) s = "";
        Map<Character, Integer> last = new HashMap<>();
        int left = 0, best = 0;
        for (int right = 0; right < s.length(); right++) {
            char c = s.charAt(right);
            if (last.containsKey(c) && last.get(c) >= left) left = last.get(c) + 1;
            last.put(c, right);
            best = Math.max(best, right - left + 1);
        }
        System.out.println(best);
    }
}`
  },
  "merge-intervals": {
    javascript: `const values = require("fs").readFileSync(0, "utf8").trim().split(/\\s+/).map(Number);
const intervals = [];
for (let i = 0; i < values.length; i += 2) intervals.push([values[i], values[i + 1]]);
intervals.sort((a, b) => a[0] - b[0]);
const merged = [];
for (const interval of intervals) {
  if (!merged.length || interval[0] > merged[merged.length - 1][1]) merged.push(interval);
  else merged[merged.length - 1][1] = Math.max(merged[merged.length - 1][1], interval[1]);
}
console.log(merged.map(item => item.join(" ")).join("\\n"));`,
    cpp: `#include <algorithm>
#include <iostream>
#include <utility>
#include <vector>
using namespace std;
int main() {
    int start, end; vector<pair<int,int>> intervals;
    while (cin >> start >> end) intervals.push_back({start, end});
    sort(intervals.begin(), intervals.end());
    vector<pair<int,int>> merged;
    for (auto interval : intervals) {
        if (merged.empty() || interval.first > merged.back().second) merged.push_back(interval);
        else merged.back().second = max(merged.back().second, interval.second);
    }
    for (size_t i = 0; i < merged.size(); ++i)
        cout << merged[i].first << ' ' << merged[i].second << (i + 1 == merged.size() ? '\\n' : '\\n');
}`,
    java: `import java.util.*;
class Main {
    public static void main(String[] args) {
        Scanner input = new Scanner(System.in);
        List<int[]> intervals = new ArrayList<>();
        while (input.hasNextInt()) intervals.add(new int[]{input.nextInt(), input.nextInt()});
        intervals.sort(Comparator.comparingInt(item -> item[0]));
        List<int[]> merged = new ArrayList<>();
        for (int[] interval : intervals) {
            if (merged.isEmpty() || interval[0] > merged.get(merged.size()-1)[1])
                merged.add(interval);
            else
                merged.get(merged.size()-1)[1] =
                    Math.max(merged.get(merged.size()-1)[1], interval[1]);
        }
        for (int[] interval : merged) System.out.println(interval[0] + " " + interval[1]);
    }
}`
  },
  "number-of-islands": {
    javascript: `const tokens = require("fs").readFileSync(0, "utf8").trim().split(/\\s+/);
const rows = Number(tokens[0]), columns = Number(tokens[1]);
const grid = tokens.slice(2, 2 + rows).map(row => row.split(""));
let islands = 0;
for (let r = 0; r < rows; r++) for (let c = 0; c < columns; c++) {
  if (grid[r][c] !== "1") continue;
  islands++;
  grid[r][c] = "0";
  const queue = [[r, c]];
  for (let i = 0; i < queue.length; i++) {
    const [cr, cc] = queue[i];
    for (const [nr, nc] of [[cr-1,cc],[cr+1,cc],[cr,cc-1],[cr,cc+1]]) {
      if (nr >= 0 && nr < rows && nc >= 0 && nc < columns && grid[nr][nc] === "1") {
        grid[nr][nc] = "0";
        queue.push([nr, nc]);
      }
    }
  }
}
console.log(islands);`,
    cpp: `#include <iostream>
#include <queue>
#include <string>
#include <vector>
using namespace std;
int main() {
    int rows, columns; cin >> rows >> columns;
    vector<string> grid(rows); for (string& row : grid) cin >> row;
    int islands = 0;
    int directions[4][2] = {{-1,0},{1,0},{0,-1},{0,1}};
    for (int r = 0; r < rows; ++r) for (int c = 0; c < columns; ++c) {
        if (grid[r][c] != '1') continue;
        ++islands; grid[r][c] = '0';
        queue<pair<int,int>> cells; cells.push({r,c});
        while (!cells.empty()) {
            auto [cr, cc] = cells.front(); cells.pop();
            for (auto& direction : directions) {
                int nr = cr + direction[0], nc = cc + direction[1];
                if (nr >= 0 && nr < rows && nc >= 0 && nc < columns && grid[nr][nc] == '1') {
                    grid[nr][nc] = '0'; cells.push({nr,nc});
                }
            }
        }
    }
    cout << islands << '\\n';
}`,
    java: `import java.util.*;
class Main {
    public static void main(String[] args) {
        Scanner input = new Scanner(System.in);
        int rows = input.nextInt(), columns = input.nextInt();
        char[][] grid = new char[rows][];
        for (int i = 0; i < rows; i++) grid[i] = input.next().toCharArray();
        int islands = 0;
        int[][] directions = {{-1,0},{1,0},{0,-1},{0,1}};
        for (int r = 0; r < rows; r++) for (int c = 0; c < columns; c++) {
            if (grid[r][c] != '1') continue;
            islands++; grid[r][c] = '0';
            Queue<int[]> queue = new ArrayDeque<>(); queue.add(new int[]{r,c});
            while (!queue.isEmpty()) {
                int[] cell = queue.remove();
                for (int[] direction : directions) {
                    int nr = cell[0] + direction[0], nc = cell[1] + direction[1];
                    if (nr >= 0 && nr < rows && nc >= 0 && nc < columns && grid[nr][nc] == '1') {
                        grid[nr][nc] = '0'; queue.add(new int[]{nr,nc});
                    }
                }
            }
        }
        System.out.println(islands);
    }
}`
  },
  "trapping-rain-water": {
    javascript: `const height = require("fs").readFileSync(0, "utf8").trim().split(/\\s+/).map(Number);
let left = 0, right = height.length - 1, leftMax = 0, rightMax = 0, water = 0;
while (left < right) {
  if (height[left] <= height[right]) {
    leftMax = Math.max(leftMax, height[left]);
    water += leftMax - height[left++];
  } else {
    rightMax = Math.max(rightMax, height[right]);
    water += rightMax - height[right--];
  }
}
console.log(water);`,
    cpp: `#include <algorithm>
#include <iostream>
#include <vector>
using namespace std;
int main() {
    int value; vector<int> height; while (cin >> value) height.push_back(value);
    int left = 0, right = (int)height.size() - 1, leftMax = 0, rightMax = 0;
    long long water = 0;
    while (left < right) {
        if (height[left] <= height[right]) {
            leftMax = max(leftMax, height[left]);
            water += leftMax - height[left++];
        } else {
            rightMax = max(rightMax, height[right]);
            water += rightMax - height[right--];
        }
    }
    cout << water << '\\n';
}`,
    java: `import java.util.*;
class Main {
    public static void main(String[] args) {
        Scanner input = new Scanner(System.in);
        List<Integer> values = new ArrayList<>();
        while (input.hasNextInt()) values.add(input.nextInt());
        int left = 0, right = values.size()-1, leftMax = 0, rightMax = 0;
        long water = 0;
        while (left < right) {
            if (values.get(left) <= values.get(right)) {
                leftMax = Math.max(leftMax, values.get(left));
                water += leftMax - values.get(left++);
            } else {
                rightMax = Math.max(rightMax, values.get(right));
                water += rightMax - values.get(right--);
            }
        }
        System.out.println(water);
    }
}`
  },
  "median-two-sorted-arrays": {
    javascript: `const lines = require("fs").readFileSync(0, "utf8").trimEnd().split(/\\r?\\n/);
let a = lines[0].trim() ? lines[0].trim().split(/\\s+/).map(Number) : [];
let b = lines[1] && lines[1].trim() ? lines[1].trim().split(/\\s+/).map(Number) : [];
if (a.length > b.length) [a, b] = [b, a];
const total = a.length + b.length, half = Math.floor((total + 1) / 2);
let left = 0, right = a.length;
while (left <= right) {
  const i = Math.floor((left + right) / 2), j = half - i;
  const al = i ? a[i-1] : -Infinity, ar = i < a.length ? a[i] : Infinity;
  const bl = j ? b[j-1] : -Infinity, br = j < b.length ? b[j] : Infinity;
  if (al <= br && bl <= ar) {
    console.log(total % 2 ? Math.max(al, bl) : (Math.max(al, bl) + Math.min(ar, br)) / 2);
    break;
  }
  if (al > br) right = i - 1; else left = i + 1;
}`,
    cpp: `#include <algorithm>
#include <climits>
#include <iostream>
#include <sstream>
#include <string>
#include <vector>
using namespace std;
vector<int> parse(const string& line) {
    stringstream stream(line); vector<int> values; int value;
    while (stream >> value) values.push_back(value);
    return values;
}
int main() {
    string first, second; getline(cin, first); getline(cin, second);
    vector<int> a = parse(first), b = parse(second);
    if (a.size() > b.size()) swap(a, b);
    int total = a.size() + b.size(), half = (total + 1) / 2;
    int left = 0, right = a.size();
    while (left <= right) {
        int i = (left + right) / 2, j = half - i;
        long long al = i ? a[i-1] : LLONG_MIN, ar = i < (int)a.size() ? a[i] : LLONG_MAX;
        long long bl = j ? b[j-1] : LLONG_MIN, br = j < (int)b.size() ? b[j] : LLONG_MAX;
        if (al <= br && bl <= ar) {
            if (total % 2) cout << max(al, bl) << ".0\\n";
            else cout << (max(al, bl) + min(ar, br)) / 2.0 << '\\n';
            return 0;
        }
        if (al > br) right = i - 1; else left = i + 1;
    }
}`,
    java: `import java.io.*;
import java.util.*;
class Main {
    static int[] parse(String line) {
        if (line == null || line.trim().isEmpty()) return new int[0];
        return Arrays.stream(line.trim().split("\\\\s+")).mapToInt(Integer::parseInt).toArray();
    }
    public static void main(String[] args) throws Exception {
        BufferedReader reader = new BufferedReader(new InputStreamReader(System.in));
        int[] a = parse(reader.readLine()), b = parse(reader.readLine());
        if (a.length > b.length) { int[] swap = a; a = b; b = swap; }
        int total = a.length + b.length, half = (total + 1) / 2;
        int left = 0, right = a.length;
        while (left <= right) {
            int i = (left + right) / 2, j = half - i;
            long al = i > 0 ? a[i-1] : Long.MIN_VALUE;
            long ar = i < a.length ? a[i] : Long.MAX_VALUE;
            long bl = j > 0 ? b[j-1] : Long.MIN_VALUE;
            long br = j < b.length ? b[j] : Long.MAX_VALUE;
            if (al <= br && bl <= ar) {
                double answer = total % 2 == 1
                    ? Math.max(al, bl)
                    : (Math.max(al, bl) + Math.min(ar, br)) / 2.0;
                System.out.println(answer); return;
            }
            if (al > br) right = i - 1; else left = i + 1;
        }
    }
}`
  }
};
