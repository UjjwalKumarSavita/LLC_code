import { Difficulty, TestCaseType, TestCaseVisibility } from "../src/generated/prisma/enums";
import type { JudgeProblemSeed } from "./judge-problems";

type Templates = Record<string, Record<"javascript" | "cpp" | "java", string>>;
const S = TestCaseVisibility.SAMPLE, P = TestCaseVisibility.PUBLIC, H = TestCaseVisibility.HIDDEN;
const edge = TestCaseType.EDGE;

export const catalogueBatchThreeProblems: JudgeProblemSeed[] = [
  {
    slug: "power-of-two", title: "Power of Two", shortDescription: "Check whether an integer is an exact power of two.",
    statement: "Given an integer n, print true if n is a power of two and false otherwise.", inputFormat: "One integer n.", outputFormat: "Print true or false.",
    constraints: "-2147483648 <= n <= 2147483647", difficulty: Difficulty.EASY, points: 20, tags: ["Math", "Bit Manipulation"],
    hints: ["A positive power of two has exactly one set bit."], examples: [{ input: "16", output: "true" }],
    tests: [{ input: "16\n", output: "true", visibility: S }, { input: "3\n", output: "false", visibility: P }, { input: "1\n", output: "true", visibility: H, testType: edge }, { input: "-8\n", output: "false", visibility: H }],
    python: `n=int(input());print("true" if n>0 and n&(n-1)==0 else "false")`
  },
  {
    slug: "count-set-bits", title: "Count Set Bits", shortDescription: "Count the one bits in a non-negative integer.",
    statement: "Given a non-negative integer n, print the number of set bits in its binary representation.", inputFormat: "One integer n.", outputFormat: "Print the set-bit count.",
    constraints: "0 <= n <= 2147483647", difficulty: Difficulty.EASY, points: 20, tags: ["Bit Manipulation"],
    hints: ["Removing the lowest set bit repeatedly takes one operation per answer bit."], examples: [{ input: "11", output: "3" }],
    tests: [{ input: "11\n", output: "3", visibility: S }, { input: "128\n", output: "1", visibility: P }, { input: "0\n", output: "0", visibility: H, testType: edge }, { input: "255\n", output: "8", visibility: H }],
    python: `n=int(input());print(n.bit_count())`
  },
  {
    slug: "greatest-common-divisor", title: "Greatest Common Divisor", shortDescription: "Find the largest divisor shared by two integers.",
    statement: "Given two positive integers, print their greatest common divisor.", inputFormat: "Two space-separated positive integers.", outputFormat: "Print their GCD.",
    constraints: "1 <= a, b <= 1000000000", difficulty: Difficulty.EASY, points: 20, tags: ["Math", "Euclidean Algorithm"],
    hints: ["Replace the larger problem with gcd(b, a mod b)."], examples: [{ input: "48 18", output: "6" }],
    tests: [{ input: "48 18\n", output: "6", visibility: S }, { input: "17 13\n", output: "1", visibility: P }, { input: "7 7\n", output: "7", visibility: H, testType: edge }, { input: "1000000000 750000000\n", output: "250000000", visibility: H }],
    python: `import math\na,b=map(int,input().split());print(math.gcd(a,b))`
  },
  {
    slug: "fibonacci-number", title: "Fibonacci Number", shortDescription: "Compute the nth Fibonacci value iteratively.",
    statement: "Given n, print F(n), where F(0)=0, F(1)=1, and F(n)=F(n-1)+F(n-2).", inputFormat: "One integer n.", outputFormat: "Print F(n).",
    constraints: "0 <= n <= 90", difficulty: Difficulty.EASY, points: 25, tags: ["Dynamic Programming", "Math"],
    hints: ["Only the previous two values are needed."], examples: [{ input: "10", output: "55" }],
    tests: [{ input: "10\n", output: "55", visibility: S }, { input: "2\n", output: "1", visibility: P }, { input: "0\n", output: "0", visibility: H, testType: edge }, { input: "20\n", output: "6765", visibility: H }],
    python: `n=int(input());a,b=0,1\nfor _ in range(n):a,b=b,a+b\nprint(a)`
  },
  {
    slug: "sorted-squares", title: "Squares of a Sorted Array", shortDescription: "Square sorted values while preserving sorted output.",
    statement: "Given a non-decreasing integer array, print the squares of its values in non-decreasing order.", inputFormat: "One sorted integer array.", outputFormat: "Print the sorted squares.",
    constraints: "1 <= n <= 100000", difficulty: Difficulty.EASY, points: 30, tags: ["Array", "Two Pointers"],
    hints: ["The largest square comes from one of the two ends."], examples: [{ input: "-4 -1 0 3 10", output: "0 1 9 16 100" }],
    tests: [{ input: "-4 -1 0 3 10\n", output: "0 1 9 16 100", visibility: S }, { input: "-7 -3 2 3 11\n", output: "4 9 9 49 121", visibility: P }, { input: "0\n", output: "0", visibility: H, testType: edge }, { input: "-5 -4 -1\n", output: "1 16 25", visibility: H }],
    python: `a=list(map(int,input().split()));print(*sorted(x*x for x in a))`
  },
  {
    slug: "remove-sorted-duplicates", title: "Remove Sorted Duplicates", shortDescription: "Keep one copy of each value in a sorted array.",
    statement: "Given a sorted integer array, print its distinct values in their original order.", inputFormat: "One sorted integer array.", outputFormat: "Print the distinct values.",
    constraints: "1 <= n <= 100000", difficulty: Difficulty.EASY, points: 25, tags: ["Array", "Two Pointers"],
    hints: ["A value is new when it differs from the last emitted value."], examples: [{ input: "1 1 2", output: "1 2" }],
    tests: [{ input: "1 1 2\n", output: "1 2", visibility: S }, { input: "0 0 1 1 1 2 2 3\n", output: "0 1 2 3", visibility: P }, { input: "5\n", output: "5", visibility: H, testType: edge }, { input: "-2 -2 -1 0 0\n", output: "-2 -1 0", visibility: H }],
    python: `a=list(map(int,input().split()));print(*[x for i,x in enumerate(a) if i==0 or x!=a[i-1]])`
  },
  {
    slug: "max-consecutive-ones", title: "Maximum Consecutive Ones", shortDescription: "Find the longest uninterrupted run of ones.",
    statement: "Given a binary array, print the maximum number of consecutive ones.", inputFormat: "One space-separated binary array.", outputFormat: "Print the longest run.",
    constraints: "1 <= n <= 100000", difficulty: Difficulty.EASY, points: 20, tags: ["Array", "Scanning"],
    hints: ["Reset the current run whenever a zero appears."], examples: [{ input: "1 1 0 1 1 1", output: "3" }],
    tests: [{ input: "1 1 0 1 1 1\n", output: "3", visibility: S }, { input: "1 0 1 1 0 1\n", output: "2", visibility: P }, { input: "0\n", output: "0", visibility: H, testType: edge }, { input: "1 1 1 1\n", output: "4", visibility: H }],
    python: `best=run=0\nfor x in map(int,input().split()):run=run+1 if x else 0;best=max(best,run)\nprint(best)`
  },
  {
    slug: "pivot-index", title: "Find Pivot Index", shortDescription: "Find an index with equal sums on both sides.",
    statement: "Given an integer array, print the leftmost index whose left sum equals its right sum. Print -1 if none exists.", inputFormat: "One integer array.", outputFormat: "Print the pivot index.",
    constraints: "1 <= n <= 100000", difficulty: Difficulty.EASY, points: 30, tags: ["Array", "Prefix Sum"],
    hints: ["The right sum is total minus the left sum and current value."], examples: [{ input: "1 7 3 6 5 6", output: "3" }],
    tests: [{ input: "1 7 3 6 5 6\n", output: "3", visibility: S }, { input: "1 2 3\n", output: "-1", visibility: P }, { input: "2 1 -1\n", output: "0", visibility: H, testType: edge }, { input: "0\n", output: "0", visibility: H }],
    python: `a=list(map(int,input().split()));left=0;total=sum(a);answer=-1\nfor i,x in enumerate(a):\n if left==total-left-x:answer=i;break\n left+=x\nprint(answer)`
  },
  {
    slug: "valid-perfect-square", title: "Valid Perfect Square", shortDescription: "Check for an integer square root without floating point.",
    statement: "Given a non-negative integer, print true if it is a perfect square and false otherwise.", inputFormat: "One integer n.", outputFormat: "Print true or false.",
    constraints: "0 <= n <= 2147483647", difficulty: Difficulty.EASY, points: 25, tags: ["Math", "Binary Search"],
    hints: ["Binary-search the possible integer roots."], examples: [{ input: "16", output: "true" }],
    tests: [{ input: "16\n", output: "true", visibility: S }, { input: "14\n", output: "false", visibility: P }, { input: "0\n", output: "true", visibility: H, testType: edge }, { input: "2147395600\n", output: "true", visibility: H }],
    python: `import math\nn=int(input());r=math.isqrt(n);print("true" if r*r==n else "false")`
  },
  {
    slug: "two-sum-sorted", title: "Two Sum in Sorted Array", shortDescription: "Use opposing pointers to find a target pair.",
    statement: "Given target on the first line and a sorted array on the second, print the zero-based indices of the unique pair whose sum equals target.", inputFormat: "Target, then the sorted array.", outputFormat: "Print two indices.",
    constraints: "2 <= n <= 100000\nExactly one answer exists.", difficulty: Difficulty.MEDIUM, points: 40, tags: ["Array", "Two Pointers"],
    hints: ["Move the left pointer up when the sum is too small."], examples: [{ input: "9\n2 7 11 15", output: "0 1" }],
    tests: [{ input: "9\n2 7 11 15\n", output: "0 1", visibility: S }, { input: "6\n2 3 4\n", output: "0 2", visibility: P }, { input: "0\n-1 1\n", output: "0 1", visibility: H, testType: edge }, { input: "10\n1 2 3 7 9\n", output: "0 4", visibility: H }],
    python: `t=int(input());a=list(map(int,input().split()));l=0;r=len(a)-1\nwhile a[l]+a[r]!=t:\n if a[l]+a[r]<t:l+=1\n else:r-=1\nprint(l,r)`
  }
].map((problem) => ({ ...problem, timeLimitMs: 8_000 }));

const js = (body:string) => `const a=require("fs").readFileSync(0,"utf8").trim().split(/\\s+/).map(Number);${body}`;
const cp = (body:string) => `#include <bits/stdc++.h>\nusing namespace std;int main(){vector<long long>a;long long x;while(cin>>x)a.push_back(x);${body}}`;
const ja = (body:string) => `import java.util.*;class Main{public static void main(String[]z){Scanner s=new Scanner(System.in);List<Long>a=new ArrayList<>();while(s.hasNextLong())a.add(s.nextLong());${body}}}`;
export const catalogueBatchThreeTemplates: Templates = {
  "power-of-two": { javascript:js(`let n=a[0];console.log(n>0&&(n&(n-1))===0?"true":"false");`), cpp:cp(`x=a[0];cout<<(x>0&&(x&(x-1))==0?"true":"false");`), java:ja(`long n=a.get(0);System.out.println(n>0&&(n&(n-1))==0?"true":"false");`) },
  "count-set-bits": { javascript:js(`let n=a[0],c=0;while(n){n&=n-1;c++}console.log(c);`), cpp:cp(`cout<<__builtin_popcountll(a[0]);`), java:ja(`System.out.println(Long.bitCount(a.get(0)));`) },
  "greatest-common-divisor": { javascript:js(`let[x,y]=a;while(y)[x,y]=[y,x%y];console.log(x);`), cpp:cp(`cout<<gcd(a[0],a[1]);`), java:ja(`long x=a.get(0),y=a.get(1);while(y!=0){long t=x%y;x=y;y=t;}System.out.println(x);`) },
  "fibonacci-number": { javascript:js(`let n=a[0],x=0,y=1;while(n--)[x,y]=[y,x+y];console.log(x);`), cpp:cp(`long long n=a[0],u=0,v=1;while(n--){x=u+v;u=v;v=x;}cout<<u;`), java:ja(`long n=a.get(0),u=0,v=1;while(n-->0){long q=u+v;u=v;v=q;}System.out.println(u);`) },
  "sorted-squares": { javascript:js(`console.log(a.map(x=>x*x).sort((x,y)=>x-y).join(" "));`), cpp:cp(`for(auto&v:a)v*=v;sort(a.begin(),a.end());for(int i=0;i<a.size();i++)cout<<(i?" ":"")<<a[i];`), java:ja(`a.replaceAll(v->v*v);Collections.sort(a);for(int i=0;i<a.size();i++)System.out.print((i>0?" ":"")+a.get(i));`) },
  "remove-sorted-duplicates": { javascript:js(`console.log(a.filter((x,i)=>i===0||x!==a[i-1]).join(" "));`), cpp:cp(`a.erase(unique(a.begin(),a.end()),a.end());for(int i=0;i<a.size();i++)cout<<(i?" ":"")<<a[i];`), java:ja(`for(int i=0;i<a.size();i++)if(i==0||!a.get(i).equals(a.get(i-1)))System.out.print((i>0?" ":"")+a.get(i));`) },
  "max-consecutive-ones": { javascript:js(`let r=0,b=0;for(const x of a){r=x?r+1:0;b=Math.max(b,r)}console.log(b);`), cpp:cp(`long long r=0,b=0;for(auto v:a){r=v?r+1:0;b=max(b,r);}cout<<b;`), java:ja(`long r=0,b=0;for(long v:a){r=v!=0?r+1:0;b=Math.max(b,r);}System.out.println(b);`) },
  "pivot-index": { javascript:js(`let t=a.reduce((x,y)=>x+y,0),l=0,r=-1;for(let i=0;i<a.length;i++){if(l===t-l-a[i]){r=i;break}l+=a[i]}console.log(r);`), cpp:cp(`long long t=accumulate(a.begin(),a.end(),0LL),l=0,r=-1;for(int i=0;i<a.size();i++){if(l==t-l-a[i]){r=i;break;}l+=a[i];}cout<<r;`), java:ja(`long t=0,l=0,r=-1;for(long v:a)t+=v;for(int i=0;i<a.size();i++){if(l==t-l-a.get(i)){r=i;break;}l+=a.get(i);}System.out.println(r);`) },
  "valid-perfect-square": { javascript:js(`let r=Math.floor(Math.sqrt(a[0]));console.log(r*r===a[0]?"true":"false");`), cpp:cp(`x=sqrt(a[0]);cout<<(x*x==a[0]?"true":"false");`), java:ja(`long n=a.get(0),r=(long)Math.sqrt(n);System.out.println(r*r==n?"true":"false");`) },
  "two-sum-sorted": { javascript:js(`let t=a.shift(),l=0,r=a.length-1;while(a[l]+a[r]!==t)a[l]+a[r]<t?l++:r--;console.log(l+" "+r);`), cpp:cp(`long long t=a[0],l=1,r=a.size()-1;while(a[l]+a[r]!=t)a[l]+a[r]<t?l++:r--;cout<<l-1<<" "<<r-1;`), java:ja(`long t=a.remove(0),l=0,r=a.size()-1;while(a.get((int)l)+a.get((int)r)!=t)if(a.get((int)l)+a.get((int)r)<t)l++;else r--;System.out.println(l+" "+r);`) }
};
