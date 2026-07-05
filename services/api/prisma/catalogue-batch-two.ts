import { Difficulty, TestCaseType, TestCaseVisibility } from "../src/generated/prisma/enums";
import type { JudgeProblemSeed } from "./judge-problems";

type ExtraLanguage = "javascript" | "cpp" | "java";
type Templates = Record<string, Record<ExtraLanguage, string>>;
const sample = TestCaseVisibility.SAMPLE;
const visible = TestCaseVisibility.PUBLIC;
const hidden = TestCaseVisibility.HIDDEN;

export const catalogueBatchTwoProblems: JudgeProblemSeed[] = [
  {
    slug: "valid-anagram",
    title: "Valid Anagram",
    shortDescription: "Decide whether two words contain identical character counts.",
    statement: "Given two lowercase words on separate lines, print true when one is an anagram of the other and false otherwise.",
    inputFormat: "The first line contains s. The second line contains t.",
    outputFormat: "Print true or false.",
    constraints: "1 <= length(s), length(t) <= 100000",
    difficulty: Difficulty.EASY, points: 20,
    tags: ["String", "Hash Map", "Sorting"],
    hints: ["Anagrams have equal lengths and equal counts for every character."],
    examples: [{ input: "anagram\nnagaram", output: "true" }],
    tests: [
      { input: "anagram\nnagaram\n", output: "true", visibility: sample },
      { input: "rat\ncar\n", output: "false", visibility: visible },
      { input: "a\na\n", output: "true", visibility: hidden, testType: TestCaseType.EDGE },
      { input: "listen\nsilent\n", output: "true", visibility: hidden }
    ],
    python: `s = input().strip()
t = input().strip()
print("true" if sorted(s) == sorted(t) else "false")`
  },
  {
    slug: "first-unique-character",
    title: "First Unique Character",
    shortDescription: "Find the first character that occurs exactly once.",
    statement: "Given one lowercase word, print the zero-based index of its first non-repeating character. Print -1 when every character repeats.",
    inputFormat: "One lowercase word.", outputFormat: "Print one integer index.",
    constraints: "1 <= length <= 100000",
    difficulty: Difficulty.EASY, points: 25,
    tags: ["String", "Hash Map", "Counting"],
    hints: ["Count every character first, then scan from left to right."],
    examples: [{ input: "leetcode", output: "0" }],
    tests: [
      { input: "leetcode\n", output: "0", visibility: sample },
      { input: "loveleetcode\n", output: "2", visibility: visible },
      { input: "aabb\n", output: "-1", visibility: hidden, testType: TestCaseType.EDGE },
      { input: "aabbcdd\n", output: "4", visibility: hidden }
    ],
    python: `from collections import Counter
s = input().strip()
counts = Counter(s)
print(next((i for i, ch in enumerate(s) if counts[ch] == 1), -1))`
  },
  {
    slug: "longest-common-prefix",
    title: "Longest Common Prefix",
    shortDescription: "Recover the prefix shared by every supplied word.",
    statement: "Given space-separated lowercase words, print their longest common prefix. Print EMPTY when no common prefix exists.",
    inputFormat: "One line containing one or more space-separated words.",
    outputFormat: "Print the longest common prefix or EMPTY.",
    constraints: "1 <= words <= 10000\n1 <= word length <= 1000",
    difficulty: Difficulty.EASY, points: 25,
    tags: ["String", "Scanning"],
    hints: ["Shorten a candidate prefix until every word starts with it."],
    examples: [{ input: "flower flow flight", output: "fl" }],
    tests: [
      { input: "flower flow flight\n", output: "fl", visibility: sample },
      { input: "dog racecar car\n", output: "EMPTY", visibility: visible },
      { input: "solo\n", output: "solo", visibility: hidden, testType: TestCaseType.EDGE },
      { input: "interview internet internal\n", output: "inter", visibility: hidden }
    ],
    python: `words = input().split()
prefix = words[0]
for word in words[1:]:
    while prefix and not word.startswith(prefix): prefix = prefix[:-1]
print(prefix if prefix else "EMPTY")`
  },
  {
    slug: "merge-sorted-arrays",
    title: "Merge Sorted Arrays",
    shortDescription: "Combine two sorted arrays into one sorted sequence.",
    statement: "Given two sorted integer arrays on separate lines, merge them and print the resulting sorted array.",
    inputFormat: "The first two lines each contain a sorted array.",
    outputFormat: "Print the merged values separated by spaces.",
    constraints: "1 <= total values <= 200000",
    difficulty: Difficulty.EASY, points: 30,
    tags: ["Array", "Two Pointers", "Sorting"],
    hints: ["Compare both front values and advance the selected side."],
    examples: [{ input: "1 3 5\n2 4 6", output: "1 2 3 4 5 6" }],
    tests: [
      { input: "1 3 5\n2 4 6\n", output: "1 2 3 4 5 6", visibility: sample },
      { input: "-4 0 9\n-3 2 10\n", output: "-4 -3 0 2 9 10", visibility: visible },
      { input: "1\n2\n", output: "1 2", visibility: hidden, testType: TestCaseType.EDGE },
      { input: "1 2 2\n2 2 3\n", output: "1 2 2 2 2 3", visibility: hidden }
    ],
    python: `a = list(map(int, input().split()))
b = list(map(int, input().split()))
i = j = 0; answer = []
while i < len(a) and j < len(b):
    if a[i] <= b[j]: answer.append(a[i]); i += 1
    else: answer.append(b[j]); j += 1
print(*(answer + a[i:] + b[j:]))`
  },
  {
    slug: "array-intersection",
    title: "Array Intersection",
    shortDescription: "Find the distinct values shared by two arrays.",
    statement: "Given two integer arrays on separate lines, print their distinct common values in ascending order. Print EMPTY when none exist.",
    inputFormat: "The first two lines each contain an array.",
    outputFormat: "Print sorted distinct shared values or EMPTY.",
    constraints: "1 <= total values <= 200000",
    difficulty: Difficulty.EASY, points: 25,
    tags: ["Array", "Hash Set", "Sorting"],
    hints: ["Sets remove duplicates and provide fast membership checks."],
    examples: [{ input: "1 2 2 1\n2 2", output: "2" }],
    tests: [
      { input: "1 2 2 1\n2 2\n", output: "2", visibility: sample },
      { input: "4 9 5\n9 4 9 8 4\n", output: "4 9", visibility: visible },
      { input: "1\n2\n", output: "EMPTY", visibility: hidden, testType: TestCaseType.EDGE },
      { input: "-2 0 1 1\n1 -2 3\n", output: "-2 1", visibility: hidden }
    ],
    python: `answer = sorted(set(map(int, input().split())) & set(map(int, input().split())))
print(*answer) if answer else print("EMPTY")`
  },
  {
    slug: "climbing-stairs",
    title: "Climbing Stairs",
    shortDescription: "Count ways to climb using one-step and two-step moves.",
    statement: "A staircase has n steps. Each move climbs one or two steps. Print the number of distinct ways to reach the top.",
    inputFormat: "One integer n.", outputFormat: "Print the number of ways.",
    constraints: "1 <= n <= 45",
    difficulty: Difficulty.EASY, points: 30,
    tags: ["Dynamic Programming", "Math"],
    hints: ["The final move came from step n-1 or n-2."],
    examples: [{ input: "5", output: "8" }],
    tests: [
      { input: "5\n", output: "8", visibility: sample },
      { input: "2\n", output: "2", visibility: visible },
      { input: "1\n", output: "1", visibility: hidden, testType: TestCaseType.EDGE },
      { input: "10\n", output: "89", visibility: hidden }
    ],
    python: `n = int(input())
a, b = 1, 1
for _ in range(n): a, b = b, a + b
print(a)`
  },
  {
    slug: "min-cost-climbing-stairs",
    title: "Min Cost Climbing Stairs",
    shortDescription: "Reach the top while paying the smallest total step cost.",
    statement: "Given step costs, start at index 0 or 1 and climb one or two steps at a time. Print the minimum cost to move beyond the final step.",
    inputFormat: "One line of space-separated step costs.",
    outputFormat: "Print the minimum total cost.",
    constraints: "2 <= n <= 100000\n0 <= cost[i] <= 100000",
    difficulty: Difficulty.MEDIUM, points: 45,
    tags: ["Array", "Dynamic Programming"],
    hints: ["Keep only the cheapest totals for the previous two positions."],
    examples: [{ input: "10 15 20", output: "15" }],
    tests: [
      { input: "10 15 20\n", output: "15", visibility: sample },
      { input: "1 100 1 1 1 100 1 1 100 1\n", output: "6", visibility: visible },
      { input: "0 0\n", output: "0", visibility: hidden, testType: TestCaseType.EDGE },
      { input: "5 6 2 4\n", output: "7", visibility: hidden }
    ],
    python: `a = b = 0
for value in map(int, input().split()): a, b = b, value + min(a, b)
print(min(a, b))`
  },
  {
    slug: "rotate-array",
    title: "Rotate Array",
    shortDescription: "Rotate an array to the right by k positions.",
    statement: "Given k and an integer array, rotate the array right by k positions and print it.",
    inputFormat: "The first line contains k. The second line contains the array.",
    outputFormat: "Print the rotated array.",
    constraints: "1 <= n <= 100000\n0 <= k <= 1000000000",
    difficulty: Difficulty.MEDIUM, points: 40,
    tags: ["Array", "Two Pointers"],
    hints: ["Reduce k modulo the array length."],
    examples: [{ input: "3\n1 2 3 4 5 6 7", output: "5 6 7 1 2 3 4" }],
    tests: [
      { input: "3\n1 2 3 4 5 6 7\n", output: "5 6 7 1 2 3 4", visibility: sample },
      { input: "2\n-1 -100 3 99\n", output: "3 99 -1 -100", visibility: visible },
      { input: "10\n7\n", output: "7", visibility: hidden, testType: TestCaseType.EDGE },
      { input: "5\n1 2 3\n", output: "2 3 1", visibility: hidden }
    ],
    python: `k = int(input())
nums = list(map(int, input().split())); k %= len(nums)
print(*(nums[-k:] + nums[:-k] if k else nums))`
  },
  {
    slug: "product-except-self",
    title: "Product Except Self",
    shortDescription: "Build each product without using its own position.",
    statement: "Print an array where each position is the product of every input value except itself. Do not use division.",
    inputFormat: "One line of space-separated integers.",
    outputFormat: "Print the resulting products.",
    constraints: "2 <= n <= 100000\nAnswers fit in signed 64-bit integers.",
    difficulty: Difficulty.MEDIUM, points: 50,
    tags: ["Array", "Prefix Product"],
    hints: ["Combine products from the left and right."],
    examples: [{ input: "1 2 3 4", output: "24 12 8 6" }],
    tests: [
      { input: "1 2 3 4\n", output: "24 12 8 6", visibility: sample },
      { input: "-1 1 0 -3 3\n", output: "0 0 9 0 0", visibility: visible },
      { input: "2 5\n", output: "5 2", visibility: hidden, testType: TestCaseType.EDGE },
      { input: "0 0 4\n", output: "0 0 0", visibility: hidden }
    ],
    python: `nums = list(map(int, input().split())); answer = [1] * len(nums); product = 1
for i, value in enumerate(nums): answer[i] = product; product *= value
product = 1
for i in range(len(nums) - 1, -1, -1): answer[i] *= product; product *= nums[i]
print(*answer)`
  },
  {
    slug: "subarray-sum-k",
    title: "Subarray Sum Equals K",
    shortDescription: "Count contiguous ranges whose values sum to a target.",
    statement: "Given target k and an integer array, print the number of contiguous non-empty subarrays whose sum equals k.",
    inputFormat: "The first line contains k. The second line contains the array.",
    outputFormat: "Print the number of matching subarrays.",
    constraints: "1 <= n <= 100000",
    difficulty: Difficulty.MEDIUM, points: 55,
    tags: ["Array", "Prefix Sum", "Hash Map"],
    hints: ["Every earlier prefix p-k completes a range ending at prefix p."],
    examples: [{ input: "2\n1 1 1", output: "2" }],
    tests: [
      { input: "2\n1 1 1\n", output: "2", visibility: sample },
      { input: "3\n1 2 3\n", output: "2", visibility: visible },
      { input: "0\n0\n", output: "1", visibility: hidden, testType: TestCaseType.EDGE },
      { input: "0\n1 -1 1 -1\n", output: "4", visibility: hidden }
    ],
    python: `from collections import defaultdict
k = int(input()); seen = defaultdict(int); seen[0] = 1; prefix = answer = 0
for value in map(int, input().split()):
    prefix += value; answer += seen[prefix - k]; seen[prefix] += 1
print(answer)`
  }
].map((problem) => ({ ...problem, timeLimitMs: 8_000 }));

const lines = `const lines = require("fs").readFileSync(0, "utf8").trim().split(/\\r?\\n/);`;
const cpp = `#include <bits/stdc++.h>
using namespace std;
vector<long long> parse(string s){istringstream in(s);vector<long long>a;long long x;while(in>>x)a.push_back(x);return a;}`;
const java = `import java.io.*;import java.util.*;class Main{static long[] parse(String s){return Arrays.stream(s.trim().split("\\\\s+")).mapToLong(Long::parseLong).toArray();}`;

export const catalogueBatchTwoTemplates: Templates = {
  "valid-anagram": {
    javascript: `${lines}const sort=s=>[...s].sort().join("");console.log(sort(lines[0])===sort(lines[1])?"true":"false");`,
    cpp: `#include <bits/stdc++.h>\nusing namespace std;int main(){string a,b;cin>>a>>b;sort(a.begin(),a.end());sort(b.begin(),b.end());cout<<(a==b?"true":"false")<<"\\n";}`,
    java: `import java.util.*;class Main{public static void main(String[]x){Scanner s=new Scanner(System.in);char[]a=s.next().toCharArray(),b=s.next().toCharArray();Arrays.sort(a);Arrays.sort(b);System.out.println(Arrays.equals(a,b)?"true":"false");}}`
  },
  "first-unique-character": {
    javascript: `const s=require("fs").readFileSync(0,"utf8").trim(),m=new Map();for(const c of s)m.set(c,(m.get(c)||0)+1);console.log([...s].findIndex(c=>m.get(c)===1));`,
    cpp: `#include <bits/stdc++.h>\nusing namespace std;int main(){string s;cin>>s;int c[256]={};for(char x:s)c[(unsigned char)x]++;int a=-1;for(int i=0;i<s.size();i++)if(c[(unsigned char)s[i]]==1){a=i;break;}cout<<a<<"\\n";}`,
    java: `import java.util.*;class Main{public static void main(String[]x){String s=new Scanner(System.in).next();int[]c=new int[26];for(char q:s.toCharArray())c[q-'a']++;int a=-1;for(int i=0;i<s.length();i++)if(c[s.charAt(i)-'a']==1){a=i;break;}System.out.println(a);}}`
  },
  "longest-common-prefix": {
    javascript: `const w=require("fs").readFileSync(0,"utf8").trim().split(/\\s+/);let p=w[0];for(const s of w.slice(1))while(p&&!s.startsWith(p))p=p.slice(0,-1);console.log(p||"EMPTY");`,
    cpp: `#include <bits/stdc++.h>\nusing namespace std;int main(){vector<string>w;string s;while(cin>>s)w.push_back(s);string p=w[0];for(int i=1;i<w.size();i++)while(p.size()&&w[i].rfind(p,0)!=0)p.pop_back();cout<<(p.size()?p:"EMPTY")<<"\\n";}`,
    java: `import java.util.*;class Main{public static void main(String[]x){Scanner s=new Scanner(System.in);List<String>w=new ArrayList<>();while(s.hasNext())w.add(s.next());String p=w.get(0);for(int i=1;i<w.size();i++)while(!p.isEmpty()&&!w.get(i).startsWith(p))p=p.substring(0,p.length()-1);System.out.println(p.isEmpty()?"EMPTY":p);}}`
  },
  "merge-sorted-arrays": {
    javascript: `${lines}let a=lines[0].split(/\\s+/).map(Number),b=lines[1].split(/\\s+/).map(Number),i=0,j=0,r=[];while(i<a.length&&j<b.length)r.push(a[i]<=b[j]?a[i++]:b[j++]);console.log(r.concat(a.slice(i),b.slice(j)).join(" "));`,
    cpp: `${cpp}int main(){string s;getline(cin,s);auto a=parse(s);getline(cin,s);auto b=parse(s);a.insert(a.end(),b.begin(),b.end());sort(a.begin(),a.end());for(int i=0;i<a.size();i++)cout<<(i?" ":"")<<a[i];cout<<"\\n";}`,
    java: `${java}public static void main(String[]x)throws Exception{BufferedReader r=new BufferedReader(new InputStreamReader(System.in));long[]a=parse(r.readLine()),b=parse(r.readLine()),z=new long[a.length+b.length];System.arraycopy(a,0,z,0,a.length);System.arraycopy(b,0,z,a.length,b.length);Arrays.sort(z);for(int i=0;i<z.length;i++)System.out.print((i>0?" ":"")+z[i]);System.out.println();}}`
  },
  "array-intersection": {
    javascript: `${lines}let a=new Set(lines[0].split(/\\s+/).map(Number)),b=new Set(lines[1].split(/\\s+/).map(Number)),r=[...a].filter(x=>b.has(x)).sort((x,y)=>x-y);console.log(r.length?r.join(" "):"EMPTY");`,
    cpp: `${cpp}int main(){string s;getline(cin,s);auto a=parse(s);getline(cin,s);auto b=parse(s);set<long long>x(b.begin(),b.end()),r;for(auto v:a)if(x.count(v))r.insert(v);if(r.empty())cout<<"EMPTY";else{int i=0;for(auto v:r)cout<<(i++?" ":"")<<v;}cout<<"\\n";}`,
    java: `${java}public static void main(String[]x)throws Exception{BufferedReader b=new BufferedReader(new InputStreamReader(System.in));Set<Long>a=new HashSet<>(),r=new TreeSet<>();for(long v:parse(b.readLine()))a.add(v);for(long v:parse(b.readLine()))if(a.contains(v))r.add(v);if(r.isEmpty())System.out.println("EMPTY");else{int i=0;for(long v:r)System.out.print((i++>0?" ":"")+v);System.out.println();}}}`
  },
  "climbing-stairs": {
    javascript: `let n=+require("fs").readFileSync(0,"utf8"),a=1,b=1;while(n--)[a,b]=[b,a+b];console.log(a);`,
    cpp: `#include <iostream>\nusing namespace std;int main(){int n;cin>>n;long long a=1,b=1;while(n--){long long c=a+b;a=b;b=c;}cout<<a<<"\\n";}`,
    java: `import java.util.*;class Main{public static void main(String[]x){int n=new Scanner(System.in).nextInt();long a=1,b=1;while(n-->0){long c=a+b;a=b;b=c;}System.out.println(a);}}`
  },
  "min-cost-climbing-stairs": {
    javascript: `let a=0,b=0;for(const v of require("fs").readFileSync(0,"utf8").trim().split(/\\s+/).map(Number))[a,b]=[b,v+Math.min(a,b)];console.log(Math.min(a,b));`,
    cpp: `#include <bits/stdc++.h>\nusing namespace std;int main(){long long x,a=0,b=0;while(cin>>x){long long c=x+min(a,b);a=b;b=c;}cout<<min(a,b)<<"\\n";}`,
    java: `import java.util.*;class Main{public static void main(String[]x){Scanner s=new Scanner(System.in);long a=0,b=0;while(s.hasNextLong()){long c=s.nextLong()+Math.min(a,b);a=b;b=c;}System.out.println(Math.min(a,b));}}`
  },
  "rotate-array": {
    javascript: `${lines}let k=+lines[0],a=lines[1].split(/\\s+/).map(Number);k%=a.length;console.log((k?a.slice(-k).concat(a.slice(0,-k)):a).join(" "));`,
    cpp: `${cpp}int main(){long long k,x;cin>>k;vector<long long>a;while(cin>>x)a.push_back(x);k%=a.size();rotate(a.begin(),a.end()-k,a.end());for(int i=0;i<a.size();i++)cout<<(i?" ":"")<<a[i];cout<<"\\n";}`,
    java: `${java}public static void main(String[]x){Scanner s=new Scanner(System.in);long k=s.nextLong();List<Long>a=new ArrayList<>();while(s.hasNextLong())a.add(s.nextLong());Collections.rotate(a,(int)(k%a.size()));for(int i=0;i<a.size();i++)System.out.print((i>0?" ":"")+a.get(i));System.out.println();}}`
  },
  "product-except-self": {
    javascript: `let a=require("fs").readFileSync(0,"utf8").trim().split(/\\s+/).map(Number),r=Array(a.length).fill(1),p=1;for(let i=0;i<a.length;i++){r[i]=p;p*=a[i]}p=1;for(let i=a.length-1;i>=0;i--){r[i]*=p;p*=a[i]}console.log(r.join(" "));`,
    cpp: `${cpp}int main(){vector<long long>a;long long x;while(cin>>x)a.push_back(x);vector<long long>r(a.size(),1);long long p=1;for(int i=0;i<a.size();i++){r[i]=p;p*=a[i];}p=1;for(int i=a.size()-1;i>=0;i--){r[i]*=p;p*=a[i];}for(int i=0;i<r.size();i++)cout<<(i?" ":"")<<r[i];cout<<"\\n";}`,
    java: `${java}public static void main(String[]x){Scanner s=new Scanner(System.in);List<Long>a=new ArrayList<>();while(s.hasNextLong())a.add(s.nextLong());long[]r=new long[a.size()];long p=1;for(int i=0;i<a.size();i++){r[i]=p;p*=a.get(i);}p=1;for(int i=a.size()-1;i>=0;i--){r[i]*=p;p*=a.get(i);}for(int i=0;i<r.length;i++)System.out.print((i>0?" ":"")+r[i]);System.out.println();}}`
  },
  "subarray-sum-k": {
    javascript: `${lines}let k=+lines[0],a=lines[1].split(/\\s+/).map(Number),m=new Map([[0,1]]),p=0,r=0;for(const x of a){p+=x;r+=m.get(p-k)||0;m.set(p,(m.get(p)||0)+1)}console.log(r);`,
    cpp: `${cpp}int main(){long long k,x,p=0,r=0;cin>>k;unordered_map<long long,long long>m;m[0]=1;while(cin>>x){p+=x;r+=m[p-k];m[p]++;}cout<<r<<"\\n";}`,
    java: `${java}public static void main(String[]x){Scanner s=new Scanner(System.in);long k=s.nextLong(),p=0,r=0;Map<Long,Long>m=new HashMap<>();m.put(0L,1L);while(s.hasNextLong()){p+=s.nextLong();r+=m.getOrDefault(p-k,0L);m.put(p,m.getOrDefault(p,0L)+1);}System.out.println(r);}}`
  }
};
