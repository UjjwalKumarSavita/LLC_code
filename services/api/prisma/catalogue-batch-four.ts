import {
  Difficulty,
  TestCaseType,
  TestCaseVisibility
} from "../src/generated/prisma/enums";
import type { JudgeProblemSeed } from "./judge-problems";

type Templates = Record<
  string,
  Record<"javascript" | "cpp" | "java", string>
>;

const sample = TestCaseVisibility.SAMPLE;
const visible = TestCaseVisibility.PUBLIC;
const hidden = TestCaseVisibility.HIDDEN;
const edge = TestCaseType.EDGE;

export const catalogueBatchFourProblems: JudgeProblemSeed[] = [
  {
    slug: "search-insert-position",
    title: "Search Insert Position",
    shortDescription: "Locate a target or its sorted insertion position.",
    statement:
      "Given a target on the first line and a strictly increasing integer array on the second line, print the index of the target or the index where it should be inserted.",
    inputFormat: "The first line contains target. The second line contains the sorted array.",
    outputFormat: "Print one zero-based index.",
    constraints: "1 <= n <= 100000\n-1000000000 <= values, target <= 1000000000",
    difficulty: Difficulty.EASY,
    points: 30,
    tags: ["Array", "Binary Search"],
    hints: ["Find the first position whose value is not smaller than the target."],
    examples: [{ input: "5\n1 3 5 6", output: "2" }],
    tests: [
      { input: "5\n1 3 5 6\n", output: "2", visibility: sample },
      { input: "2\n1 3 5 6\n", output: "1", visibility: visible },
      { input: "0\n1\n", output: "0", visibility: hidden, testType: edge },
      { input: "7\n1 3 5 6\n", output: "4", visibility: hidden }
    ],
    python: `import bisect
target = int(input())
nums = list(map(int, input().split()))
print(bisect.bisect_left(nums, target))`
  },
  {
    slug: "house-robber",
    title: "House Robber",
    shortDescription: "Maximize value without selecting adjacent houses.",
    statement:
      "Given non-negative values stored in houses along one street, print the maximum total obtainable without choosing two adjacent houses.",
    inputFormat: "One line of space-separated non-negative integers.",
    outputFormat: "Print the maximum obtainable total.",
    constraints: "1 <= n <= 100000\n0 <= value <= 1000000",
    difficulty: Difficulty.MEDIUM,
    points: 50,
    tags: ["Array", "Dynamic Programming"],
    hints: ["At each house, compare skipping it with taking it after the best result two positions back."],
    examples: [{ input: "1 2 3 1", output: "4" }],
    tests: [
      { input: "1 2 3 1\n", output: "4", visibility: sample },
      { input: "2 7 9 3 1\n", output: "12", visibility: visible },
      { input: "8\n", output: "8", visibility: hidden, testType: edge },
      { input: "5 1 1 5\n", output: "10", visibility: hidden }
    ],
    python: `previous = current = 0
for value in map(int, input().split()):
    previous, current = current, max(current, previous + value)
print(current)`
  },
  {
    slug: "plus-one",
    title: "Plus One",
    shortDescription: "Increment an integer represented as decimal digits.",
    statement:
      "Given the digits of a non-negative integer separated by spaces, add one and print the resulting digits separated by spaces.",
    inputFormat: "One line of decimal digits.",
    outputFormat: "Print the incremented digit array.",
    constraints: "1 <= number of digits <= 100000\nThe first digit is non-zero unless the number is zero.",
    difficulty: Difficulty.EASY,
    points: 25,
    tags: ["Array", "Math"],
    hints: ["Propagate a carry from the final digit toward the front."],
    examples: [{ input: "1 2 3", output: "1 2 4" }],
    tests: [
      { input: "1 2 3\n", output: "1 2 4", visibility: sample },
      { input: "4 3 2 1\n", output: "4 3 2 2", visibility: visible },
      { input: "0\n", output: "1", visibility: hidden, testType: edge },
      { input: "9 9 9\n", output: "1 0 0 0", visibility: hidden }
    ],
    python: `digits = list(map(int, input().split()))
carry = 1
for index in range(len(digits) - 1, -1, -1):
    digits[index] += carry
    carry, digits[index] = divmod(digits[index], 10)
if carry: digits.insert(0, carry)
print(*digits)`
  },
  {
    slug: "happy-number",
    title: "Happy Number",
    shortDescription: "Detect whether repeated digit-square sums reach one.",
    statement:
      "Repeatedly replace a positive integer by the sum of the squares of its digits. Print true if the process reaches 1 and false if it enters a cycle.",
    inputFormat: "One positive integer n.",
    outputFormat: "Print true or false.",
    constraints: "1 <= n <= 2147483647",
    difficulty: Difficulty.EASY,
    points: 30,
    tags: ["Math", "Hash Set", "Cycle Detection"],
    hints: ["Remember previously seen values; seeing one twice proves a cycle."],
    examples: [{ input: "19", output: "true" }],
    tests: [
      { input: "19\n", output: "true", visibility: sample },
      { input: "2\n", output: "false", visibility: visible },
      { input: "1\n", output: "true", visibility: hidden, testType: edge },
      { input: "7\n", output: "true", visibility: hidden }
    ],
    python: `n = int(input())
seen = set()
while n != 1 and n not in seen:
    seen.add(n)
    n = sum(int(digit) ** 2 for digit in str(n))
print("true" if n == 1 else "false")`
  },
  {
    slug: "integer-square-root",
    title: "Integer Square Root",
    shortDescription: "Find the floor of a square root without floating point.",
    statement:
      "Given a non-negative integer x, print the greatest integer r such that r multiplied by r is at most x.",
    inputFormat: "One non-negative integer x.",
    outputFormat: "Print floor(sqrt(x)).",
    constraints: "0 <= x <= 2147483647",
    difficulty: Difficulty.EASY,
    points: 30,
    tags: ["Math", "Binary Search"],
    hints: ["Binary-search candidate roots from zero through x."],
    examples: [{ input: "8", output: "2" }],
    tests: [
      { input: "8\n", output: "2", visibility: sample },
      { input: "16\n", output: "4", visibility: visible },
      { input: "0\n", output: "0", visibility: hidden, testType: edge },
      { input: "2147395600\n", output: "46340", visibility: hidden }
    ],
    python: `import math
print(math.isqrt(int(input())))`
  },
  {
    slug: "normalized-palindrome",
    title: "Normalized Palindrome",
    shortDescription: "Ignore punctuation and letter case when checking symmetry.",
    statement:
      "Given one line of text, keep only letters and digits, compare without case, and print true when the normalized text is a palindrome.",
    inputFormat: "One line of text.",
    outputFormat: "Print true or false.",
    constraints: "1 <= line length <= 100000",
    difficulty: Difficulty.EASY,
    points: 30,
    tags: ["String", "Two Pointers"],
    hints: ["Move two pointers inward while skipping non-alphanumeric characters."],
    examples: [{ input: "A man, a plan, a canal: Panama", output: "true" }],
    tests: [
      { input: "A man, a plan, a canal: Panama\n", output: "true", visibility: sample },
      { input: "race a car\n", output: "false", visibility: visible },
      { input: "0P\n", output: "false", visibility: hidden, testType: edge },
      { input: "No lemon, no melon!\n", output: "true", visibility: hidden }
    ],
    python: `text = "".join(ch.lower() for ch in input() if ch.isalnum())
print("true" if text == text[::-1] else "false")`
  },
  {
    slug: "ransom-note",
    title: "Ransom Note",
    shortDescription: "Check whether available letters can construct a target.",
    statement:
      "Given a lowercase target word and available letters on separate lines, print true if every target character can be supplied and false otherwise.",
    inputFormat: "The first line contains the target. The second contains available letters.",
    outputFormat: "Print true or false.",
    constraints: "1 <= each length <= 100000",
    difficulty: Difficulty.EASY,
    points: 25,
    tags: ["String", "Hash Map", "Counting"],
    hints: ["Subtract target character counts from the available inventory."],
    examples: [{ input: "aa\naab", output: "true" }],
    tests: [
      { input: "aa\naab\n", output: "true", visibility: sample },
      { input: "aa\nab\n", output: "false", visibility: visible },
      { input: "a\na\n", output: "true", visibility: hidden, testType: edge },
      { input: "code\ncodecademy\n", output: "true", visibility: hidden }
    ],
    python: `from collections import Counter
target = Counter(input().strip())
available = Counter(input().strip())
print("true" if all(available[ch] >= count for ch, count in target.items()) else "false")`
  },
  {
    slug: "isomorphic-strings",
    title: "Isomorphic Strings",
    shortDescription: "Verify a consistent one-to-one character mapping.",
    statement:
      "Given two equal-length words, print true if characters in the first can be replaced consistently and one-to-one to form the second.",
    inputFormat: "Two words on separate lines.",
    outputFormat: "Print true or false.",
    constraints: "1 <= length <= 100000\nThe words have equal length.",
    difficulty: Difficulty.EASY,
    points: 35,
    tags: ["String", "Hash Map"],
    hints: ["Track mappings in both directions to prevent two source characters sharing one target."],
    examples: [{ input: "egg\nadd", output: "true" }],
    tests: [
      { input: "egg\nadd\n", output: "true", visibility: sample },
      { input: "foo\nbar\n", output: "false", visibility: visible },
      { input: "a\na\n", output: "true", visibility: hidden, testType: edge },
      { input: "paper\ntitle\n", output: "true", visibility: hidden }
    ],
    python: `first = input().strip()
second = input().strip()
forward, backward = {}, {}
valid = True
for left, right in zip(first, second):
    if forward.get(left, right) != right or backward.get(right, left) != left:
        valid = False; break
    forward[left] = right; backward[right] = left
print("true" if valid else "false")`
  },
  {
    slug: "pascal-row",
    title: "Pascal Triangle Row",
    shortDescription: "Generate one zero-indexed row of Pascal’s triangle.",
    statement:
      "Given a zero-indexed row number, print that row of Pascal's triangle as space-separated integers.",
    inputFormat: "One integer row.",
    outputFormat: "Print row + 1 integers.",
    constraints: "0 <= row <= 33",
    difficulty: Difficulty.EASY,
    points: 30,
    tags: ["Array", "Math", "Dynamic Programming"],
    hints: ["Each interior value is the sum of the two values above it."],
    examples: [{ input: "3", output: "1 3 3 1" }],
    tests: [
      { input: "3\n", output: "1 3 3 1", visibility: sample },
      { input: "5\n", output: "1 5 10 10 5 1", visibility: visible },
      { input: "0\n", output: "1", visibility: hidden, testType: edge },
      { input: "1\n", output: "1 1", visibility: hidden }
    ],
    python: `row = int(input())
answer = [1]
for index in range(1, row + 1):
    answer.append(answer[-1] * (row - index + 1) // index)
print(*answer)`
  },
  {
    slug: "find-peak-element",
    title: "Find Peak Element",
    shortDescription: "Find a value greater than both virtual neighbors.",
    statement:
      "Given an integer array where adjacent values differ, print the index of any peak. Values outside the array are treated as negative infinity.",
    inputFormat: "One line of space-separated integers.",
    outputFormat: "Print a valid zero-based peak index.",
    constraints: "1 <= n <= 100000\nAdjacent values are different.",
    difficulty: Difficulty.MEDIUM,
    points: 45,
    tags: ["Array", "Binary Search"],
    hints: ["When the slope rises to the right, a peak must exist on the right side."],
    examples: [{ input: "1 2 3 1", output: "2" }],
    tests: [
      { input: "1 2 3 1\n", output: "2", visibility: sample },
      { input: "1 2 1\n", output: "1", visibility: visible },
      { input: "7\n", output: "0", visibility: hidden, testType: edge },
      { input: "5 4 3 2 1\n", output: "0", visibility: hidden }
    ],
    python: `nums = list(map(int, input().split()))
left, right = 0, len(nums) - 1
while left < right:
    middle = (left + right) // 2
    if nums[middle] < nums[middle + 1]: left = middle + 1
    else: right = middle
print(left)`
  }
].map((problem) => ({ ...problem, timeLimitMs: 8_000 }));

const jsLines =
  `const lines=require("fs").readFileSync(0,"utf8").trim().split(/\\r?\\n/);`;
const cppBase = `#include <bits/stdc++.h>
using namespace std;`;
const javaBase = `import java.io.*;import java.util.*;class Main{`;

export const catalogueBatchFourTemplates: Templates = {
  "search-insert-position": {
    javascript: `${jsLines}const t=+lines[0],a=lines[1].split(/\\s+/).map(Number);let l=0,r=a.length;while(l<r){const m=(l+r)>>1;if(a[m]<t)l=m+1;else r=m}console.log(l);`,
    cpp: `${cppBase}int main(){long long t,x;cin>>t;vector<long long>a;while(cin>>x)a.push_back(x);cout<<lower_bound(a.begin(),a.end(),t)-a.begin();}`,
    java: `${javaBase}public static void main(String[]z){Scanner s=new Scanner(System.in);long t=s.nextLong();List<Long>a=new ArrayList<>();while(s.hasNextLong())a.add(s.nextLong());int l=0,r=a.size();while(l<r){int m=(l+r)/2;if(a.get(m)<t)l=m+1;else r=m;}System.out.println(l);}}`
  },
  "house-robber": {
    javascript: `const a=require("fs").readFileSync(0,"utf8").trim().split(/\\s+/).map(Number);let p=0,c=0;for(const x of a)[p,c]=[c,Math.max(c,p+x)];console.log(c);`,
    cpp: `${cppBase}int main(){long long x,p=0,c=0;while(cin>>x){long long n=max(c,p+x);p=c;c=n;}cout<<c;}`,
    java: `${javaBase}public static void main(String[]z){Scanner s=new Scanner(System.in);long p=0,c=0;while(s.hasNextLong()){long n=Math.max(c,p+s.nextLong());p=c;c=n;}System.out.println(c);}}`
  },
  "plus-one": {
    javascript: `let a=require("fs").readFileSync(0,"utf8").trim().split(/\\s+/).map(Number),c=1;for(let i=a.length-1;i>=0&&c;i--){a[i]++;c=a[i]===10?1:0;if(c)a[i]=0}if(c)a.unshift(1);console.log(a.join(" "));`,
    cpp: `${cppBase}int main(){vector<int>a;int x;while(cin>>x)a.push_back(x);int c=1;for(int i=a.size()-1;i>=0&&c;i--){a[i]++;c=a[i]/10;a[i]%=10;}if(c)a.insert(a.begin(),c);for(int i=0;i<a.size();i++)cout<<(i?" ":"")<<a[i];}`,
    java: `${javaBase}public static void main(String[]z){Scanner s=new Scanner(System.in);List<Integer>a=new ArrayList<>();while(s.hasNextInt())a.add(s.nextInt());int c=1;for(int i=a.size()-1;i>=0&&c>0;i--){int v=a.get(i)+c;a.set(i,v%10);c=v/10;}if(c>0)a.add(0,c);for(int i=0;i<a.size();i++)System.out.print((i>0?" ":"")+a.get(i));}}`
  },
  "happy-number": {
    javascript: `let n=+require("fs").readFileSync(0,"utf8"),s=new Set();while(n!==1&&!s.has(n)){s.add(n);n=[...String(n)].reduce((a,d)=>a+(+d)**2,0)}console.log(n===1?"true":"false");`,
    cpp: `${cppBase}int main(){int n;cin>>n;set<int>s;while(n!=1&&!s.count(n)){s.insert(n);int q=0;while(n){q+=(n%10)*(n%10);n/=10;}n=q;}cout<<(n==1?"true":"false");}`,
    java: `${javaBase}public static void main(String[]z){int n=new Scanner(System.in).nextInt();Set<Integer>s=new HashSet<>();while(n!=1&&!s.contains(n)){s.add(n);int q=0;while(n>0){int d=n%10;q+=d*d;n/=10;}n=q;}System.out.println(n==1?"true":"false");}}`
  },
  "integer-square-root": {
    javascript: `const n=+require("fs").readFileSync(0,"utf8");console.log(Math.floor(Math.sqrt(n)));`,
    cpp: `${cppBase}int main(){long long n,l=0;cin>>n;long long r=n+1;while(l+1<r){long long m=(l+r)/2;if(m*m<=n)l=m;else r=m;}cout<<l;}`,
    java: `${javaBase}public static void main(String[]z){long n=new Scanner(System.in).nextLong(),l=0,r=n+1;while(l+1<r){long m=(l+r)/2;if(m*m<=n)l=m;else r=m;}System.out.println(l);}}`
  },
  "normalized-palindrome": {
    javascript: `const s=require("fs").readFileSync(0,"utf8").toLowerCase().replace(/[^a-z0-9]/g,"");console.log(s===[...s].reverse().join("")?"true":"false");`,
    cpp: `${cppBase}int main(){string s,t;getline(cin,s);for(char c:s)if(isalnum((unsigned char)c))t+=tolower((unsigned char)c);string r=t;reverse(r.begin(),r.end());cout<<(t==r?"true":"false");}`,
    java: `${javaBase}public static void main(String[]z)throws Exception{String s=new BufferedReader(new InputStreamReader(System.in)).readLine().toLowerCase().replaceAll("[^a-z0-9]","");System.out.println(s.equals(new StringBuilder(s).reverse().toString())?"true":"false");}}`
  },
  "ransom-note": {
    javascript: `${jsLines}const c={};for(const x of lines[1])c[x]=(c[x]||0)+1;console.log([...lines[0]].every(x=>c[x]-- >0)?"true":"false");`,
    cpp: `${cppBase}int main(){string a,b;cin>>a>>b;int c[256]={};for(char x:b)c[(unsigned char)x]++;bool ok=1;for(char x:a)if(--c[(unsigned char)x]<0)ok=0;cout<<(ok?"true":"false");}`,
    java: `${javaBase}public static void main(String[]z){Scanner s=new Scanner(System.in);String a=s.next(),b=s.next();int[]c=new int[256];for(char x:b.toCharArray())c[x]++;boolean ok=true;for(char x:a.toCharArray())if(--c[x]<0)ok=false;System.out.println(ok?"true":"false");}}`
  },
  "isomorphic-strings": {
    javascript: `${jsLines}let a={},b={},ok=true;for(let i=0;i<lines[0].length;i++){let x=lines[0][i],y=lines[1][i];if((a[x]&&a[x]!==y)||(b[y]&&b[y]!==x))ok=false;a[x]=y;b[y]=x}console.log(ok?"true":"false");`,
    cpp: `${cppBase}int main(){string a,b;cin>>a>>b;map<char,char>x,y;bool ok=1;for(int i=0;i<a.size();i++){if((x.count(a[i])&&x[a[i]]!=b[i])||(y.count(b[i])&&y[b[i]]!=a[i]))ok=0;x[a[i]]=b[i];y[b[i]]=a[i];}cout<<(ok?"true":"false");}`,
    java: `${javaBase}public static void main(String[]z){Scanner s=new Scanner(System.in);String a=s.next(),b=s.next();Map<Character,Character>x=new HashMap<>(),y=new HashMap<>();boolean ok=true;for(int i=0;i<a.length();i++){char p=a.charAt(i),q=b.charAt(i);if((x.containsKey(p)&&x.get(p)!=q)||(y.containsKey(q)&&y.get(q)!=p))ok=false;x.put(p,q);y.put(q,p);}System.out.println(ok?"true":"false");}}`
  },
  "pascal-row": {
    javascript: `const n=+require("fs").readFileSync(0,"utf8");let a=[1];for(let i=1;i<=n;i++)a.push(a[i-1]*(n-i+1)/i);console.log(a.join(" "));`,
    cpp: `${cppBase}int main(){long long n;cin>>n;vector<long long>a(1,1);for(long long i=1;i<=n;i++)a.push_back(a.back()*(n-i+1)/i);for(int i=0;i<a.size();i++)cout<<(i?" ":"")<<a[i];}`,
    java: `${javaBase}public static void main(String[]z){long n=new Scanner(System.in).nextLong();List<Long>a=new ArrayList<>();a.add(1L);for(long i=1;i<=n;i++)a.add(a.get(a.size()-1)*(n-i+1)/i);for(int i=0;i<a.size();i++)System.out.print((i>0?" ":"")+a.get(i));}}`
  },
  "find-peak-element": {
    javascript: `const a=require("fs").readFileSync(0,"utf8").trim().split(/\\s+/).map(Number);let l=0,r=a.length-1;while(l<r){let m=(l+r)>>1;if(a[m]<a[m+1])l=m+1;else r=m}console.log(l);`,
    cpp: `${cppBase}int main(){vector<long long>a;long long x;while(cin>>x)a.push_back(x);int l=0,r=a.size()-1;while(l<r){int m=(l+r)/2;if(a[m]<a[m+1])l=m+1;else r=m;}cout<<l;}`,
    java: `${javaBase}public static void main(String[]z){Scanner s=new Scanner(System.in);List<Long>a=new ArrayList<>();while(s.hasNextLong())a.add(s.nextLong());int l=0,r=a.size()-1;while(l<r){int m=(l+r)/2;if(a.get(m)<a.get(m+1))l=m+1;else r=m;}System.out.println(l);}}`
  }
};
