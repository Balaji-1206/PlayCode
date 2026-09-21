import type { ParsedProblem } from "@/lib/schemas/problem";

export const JUSPAY_PROBLEMS: Record<string, ParsedProblem> = {
  "closest-meeting-node": {
    title: "Find Closest Node to Given Two Nodes",
    difficulty: "Medium",
    description: `You are given a directed graph of \`n\` nodes numbered from \`0\` to \`n - 1\`, where each node has **at most one outgoing edge**.

The graph is represented with a given 0-indexed array \`edges\` of size \`n\`, indicating that there is a directed edge from node \`i\` to node \`edges[i]\`. If there is no outgoing edge from \`i\`, then \`edges[i] == -1\`.

You are also given two integers, \`node1\` and \`node2\`.

Return the **index of the node** that can be reached from both \`node1\` and \`node2\`, such that:

\`\`\`text
max(distance(node1, node), distance(node2, node))
\`\`\`

is **minimized**. If there are multiple answers that yield the same maximum distance, return the node with the **smallest index**. If no possible answer exists, return \`-1\`.`,
    tags: ["Graph", "Depth-First Search", "Breadth-First Search", "Juspay"],
    constraints: [
      "2 <= edges.length <= 10⁵",
      "-1 <= edges[i] < edges.length",
      "edges[i] != i",
      "0 <= node1, node2 < edges.length",
    ],
    inputFormat: "N (number of nodes), followed by N integers for edges array, then node1 and node2.",
    outputFormat: "The index of the closest meeting node, or -1 if unreachable.",
    examples: [
      {
        input: "4\n2 2 3 -1\n0 1",
        output: "2",
        explanation: "Distance from 0 to 2 is 1, distance from 1 to 2 is 1. Maximum of both distances is 1, which is minimal. We return node 2.",
      },
      {
        input: "10\n4 4 8 -1 9 8 4 4 1 1\n5 6",
        output: "1",
        explanation: "Node 1 and node 4 both have max distance 3. We choose node 1 because it has the smaller index.",
      },
      {
        input: "4\n1 0 3 -1\n0 2",
        output: "-1",
        explanation: "No common reachable node exists between node 0 and node 2.",
      },
    ],
    functionSignature: {
      functionName: "closestMeetingNode",
      parameters: [
        { name: "edges", type: "int[]", description: "Outgoing directed edge for each node (-1 if none)" },
        { name: "node1", type: "int", description: "First starting node index" },
        { name: "node2", type: "int", description: "Second starting node index" },
      ],
      returnType: "int",
      returnDescription: "Smallest index of the closest meeting node, or -1 if unreachable",
    },
    starterCode: {
      cpp: `#include <iostream>
#include <vector>
#include <algorithm>
#include <climits>

using namespace std;

class Solution {
public:
    int closestMeetingNode(vector<int>& edges, int node1, int node2) {
        // Write your solution here
        return -1;
    }
};

int main() {
    Solution s;

    int n;
    if (cin >> n) {
        vector<int> edges(n);
        for (int i = 0; i < n; i++) {
            cin >> edges[i];
        }

        int node1, node2;
        cin >> node1 >> node2;

        cout << s.closestMeetingNode(edges, node1, node2) << "\\n";
    }

    return 0;
}
`,
      python: `class Solution:
    def closestMeetingNode(self, edges: list[int], node1: int, node2: int) -> int:
        # Write your solution here
        pass

if __name__ == "__main__":
    import sys
    data = sys.stdin.read().split()
    if data:
        n = int(data[0])
        edges = [int(x) for x in data[1:n+1]]
        node1 = int(data[n+1])
        node2 = int(data[n+2])
        sol = Solution()
        print(sol.closestMeetingNode(edges, node1, node2))
`,
      javascript: `/**
 * @param {number[]} edges
 * @param {number} node1
 * @param {number} node2
 * @return {number}
 */
function closestMeetingNode(edges, node1, node2) {
    // Write your solution here
    return -1;
}
`,
      java: `import java.util.*;

class Solution {
    public int closestMeetingNode(int[] edges, int node1, int node2) {
        // Write your solution here
        return -1;
    }

    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        if (sc.hasNextInt()) {
            int n = sc.nextInt();
            int[] edges = new int[n];
            for (int i = 0; i < n; i++) edges[i] = sc.nextInt();
            int node1 = sc.nextInt();
            int node2 = sc.nextInt();
            Solution sol = new Solution();
            System.out.println(sol.closestMeetingNode(edges, node1, node2));
        }
    }
}
`,
      go: `package main

import (
	"fmt"
)

func closestMeetingNode(edges []int, node1 int, node2 int) int {
	// Write your solution here
	return -1
}

func main() {
	var n int
	if _, err := fmt.Scan(&n); err == nil {
		edges := make([]int, n)
		for i := 0; i < n; i++ {
			fmt.Scan(&edges[i])
		}
		var node1, node2 int
		fmt.Scan(&node1, &node2)
		fmt.Println(closestMeetingNode(edges, node1, node2))
	}
}
`,
      rust: `impl Solution {
    pub fn closest_meeting_node(edges: Vec<i32>, node1: i32, node2: i32) -> i32 {
        // Write your solution here
        -1
    }
}
`,
    },
    referenceSolution: {
      cpp: `#include <iostream>
#include <vector>
#include <algorithm>
#include <climits>

using namespace std;

class Solution {
public:
    int closestMeetingNode(vector<int>& edges, int node1, int node2) {
        int n = edges.size();
        vector<int> dist1(n, -1);
        vector<int> dist2(n, -1);

        // Distance from node1
        int node = node1;
        int cost = 0;
        while (node != -1 && dist1[node] == -1) {
            dist1[node] = cost++;
            node = edges[node];
        }

        // Distance from node2
        node = node2;
        cost = 0;
        while (node != -1 && dist2[node] == -1) {
            dist2[node] = cost++;
            node = edges[node];
        }

        int minCost = INT_MAX;
        int ans = -1;

        for (int i = 0; i < n; i++) {
            if (dist1[i] != -1 && dist2[i] != -1) {
                int c = max(dist1[i], dist2[i]);
                if (c < minCost) {
                    minCost = c;
                    ans = i;
                }
            }
        }

        return ans;
    }
};

int main() {
    Solution s;
    int n;
    if (cin >> n) {
        vector<int> edges(n);
        for (int i = 0; i < n; i++) cin >> edges[i];
        int node1, node2;
        cin >> node1 >> node2;
        cout << s.closestMeetingNode(edges, node1, node2) << "\\n";
    }
    return 0;
}
`,
      python: `class Solution:
    def closestMeetingNode(self, edges: list[int], node1: int, node2: int) -> int:
        n = len(edges)
        dist1 = [-1] * n
        dist2 = [-1] * n

        node = node1
        cost = 0
        while node != -1 and dist1[node] == -1:
            dist1[node] = cost
            cost += 1
            node = edges[node]

        node = node2
        cost = 0
        while node != -1 and dist2[node] == -1:
            dist2[node] = cost
            cost += 1
            node = edges[node]

        min_cost = float('inf')
        ans = -1
        for i in range(n):
            if dist1[i] != -1 and dist2[i] != -1:
                c = max(dist1[i], dist2[i])
                if c < min_cost:
                    min_cost = c
                    ans = i
        return ans
`,
      javascript: `function closestMeetingNode(edges, node1, node2) {
    const n = edges.length;
    const dist1 = new Array(n).fill(-1);
    const dist2 = new Array(n).fill(-1);

    let node = node1;
    let cost = 0;
    while (node !== -1 && dist1[node] === -1) {
        dist1[node] = cost++;
        node = edges[node];
    }

    node = node2;
    cost = 0;
    while (node !== -1 && dist2[node] === -1) {
        dist2[node] = cost++;
        node = edges[node];
    }

    let minCost = Infinity;
    let ans = -1;
    for (let i = 0; i < n; i++) {
        if (dist1[i] !== -1 && dist2[i] !== -1) {
            const c = Math.max(dist1[i], dist2[i]);
            if (c < minCost) {
                minCost = c;
                ans = i;
            }
        }
    }
    return ans;
}
`,
      java: `import java.util.*;

class Solution {
    public int closestMeetingNode(int[] edges, int node1, int node2) {
        int n = edges.length;
        int[] dist1 = new int[n];
        int[] dist2 = new int[n];
        Arrays.fill(dist1, -1);
        Arrays.fill(dist2, -1);

        int node = node1;
        int cost = 0;
        while (node != -1 && dist1[node] == -1) {
            dist1[node] = cost++;
            node = edges[node];
        }

        node = node2;
        cost = 0;
        while (node != -1 && dist2[node] == -1) {
            dist2[node] = cost++;
            node = edges[node];
        }

        int minCost = Integer.MAX_VALUE;
        int ans = -1;
        for (int i = 0; i < n; i++) {
            if (dist1[i] != -1 && dist2[i] != -1) {
                int c = Math.max(dist1[i], dist2[i]);
                if (c < minCost) {
                    minCost = c;
                    ans = i;
                }
            }
        }
        return ans;
    }
}
`,
      go: `func closestMeetingNode(edges []int, node1 int, node2 int) int {
	n := len(edges)
	dist1 := make([]int, n)
	dist2 := make([]int, n)
	for i := range dist1 {
		dist1[i] = -1
		dist2[i] = -1
	}

	node := node1
	cost := 0
	for node != -1 && dist1[node] == -1 {
		dist1[node] = cost
		cost++
		node = edges[node]
	}

	node = node2
	cost = 0
	for node != -1 && dist2[node] == -1 {
		dist2[node] = cost
		cost++
		node = edges[node]
	}

	minCost := int(1e9)
	ans := -1
	for i := 0; i < n; i++ {
		if dist1[i] != -1 && dist2[i] != -1 {
			c := dist1[i]
			if dist2[i] > c {
				c = dist2[i]
			}
			if c < minCost {
				minCost = c
				ans = i
			}
		}
	}
	return ans
}
`,
      rust: `impl Solution {
    pub fn closest_meeting_node(edges: Vec<i32>, node1: i32, node2: i32) -> i32 {
        let n = edges.len();
        let mut dist1 = vec![-1; n];
        let mut dist2 = vec![-1; n];

        let mut node = node1;
        let mut cost = 0;
        while node != -1 && dist1[node as usize] == -1 {
            dist1[node as usize] = cost;
            cost += 1;
            node = edges[node as usize];
        }

        let mut node = node2;
        let mut cost = 0;
        while node != -1 && dist2[node as usize] == -1 {
            dist2[node as usize] = cost;
            cost += 1;
            node = edges[node as usize];
        }

        let mut min_cost = i32::MAX;
        let mut ans = -1;
        for i in 0..n {
            if dist1[i] != -1 && dist2[i] != -1 {
                let c = dist1[i].max(dist2[i]);
                if c < min_cost {
                    min_cost = c;
                    ans = i as i32;
                }
            }
        }
        ans
    }
}
`,
    },
    editorial: {
      approach: "Perform two independent iterative traversals using while loops from node1 and node2 to record distances. Because each node has at most one outgoing edge, a while loop with a visited/distance check traverses each path in O(N) time without recursion stack overflow. Finally, scan from index 0 to N-1 to find the common node minimizing max(dist1, dist2), naturally tie-breaking to the smallest index.",
      timeComplexity: "O(N) — Each starting node traverses at most N nodes once, followed by an O(N) scan across all node indices.",
      spaceComplexity: "O(N) — Distance vectors dist1 and dist2 of size N.",
    },
    driverCode: {
      cpp: `
int main() {
    int n;
    if (cin >> n) {
        vector<int> edges(n);
        for (int i = 0; i < n; i++) cin >> edges[i];
        int node1, node2;
        cin >> node1 >> node2;
        Solution sol;
        int res = sol.closestMeetingNode(edges, node1, node2);
        cout << "__PLAYCODE_RESULT_START__\\n" << res << "\\n__PLAYCODE_RESULT_END__" << endl;
    }
    return 0;
}
`,
      python: `
import sys

if __name__ == "__main__":
    data = sys.stdin.read().split()
    if data:
        n = int(data[0])
        edges = [int(x) for x in data[1:n+1]]
        node1 = int(data[n+1])
        node2 = int(data[n+2])
        sol = Solution()
        res = sol.closestMeetingNode(edges, node1, node2)
        print("__PLAYCODE_RESULT_START__")
        print(res)
        print("__PLAYCODE_RESULT_END__")
`,
      javascript: `
const fs = require('fs');
const input = fs.readFileSync(0, 'utf-8').trim().split(/\\s+/);
if (input.length >= 3) {
    const n = parseInt(input[0], 10);
    const edges = [];
    for (let i = 0; i < n; i++) edges.push(parseInt(input[1 + i], 10));
    const node1 = parseInt(input[n + 1], 10);
    const node2 = parseInt(input[n + 2], 10);
    const res = closestMeetingNode(edges, node1, node2);
    console.log("__PLAYCODE_RESULT_START__");
    console.log(res);
    console.log("__PLAYCODE_RESULT_END__");
}
`,
      java: `
import java.util.*;

public class Main {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        if (sc.hasNextInt()) {
            int n = sc.nextInt();
            int[] edges = new int[n];
            for (int i = 0; i < n; i++) edges[i] = sc.nextInt();
            int node1 = sc.nextInt();
            int node2 = sc.nextInt();
            Solution sol = new Solution();
            int res = sol.closestMeetingNode(edges, node1, node2);
            System.out.println("__PLAYCODE_RESULT_START__");
            System.out.println(res);
            System.out.println("__PLAYCODE_RESULT_END__");
        }
    }
}
`,
      go: `
package main

import (
	"fmt"
)

func main() {
	var n int
	if _, err := fmt.Scan(&n); err == nil {
		edges := make([]int, n)
		for i := 0; i < n; i++ {
			fmt.Scan(&edges[i])
		}
		var node1, node2 int
		fmt.Scan(&node1, &node2)
		res := closestMeetingNode(edges, node1, node2)
		fmt.Println("__PLAYCODE_RESULT_START__")
		fmt.Println(res)
		fmt.Println("__PLAYCODE_RESULT_END__")
	}
}
`,
      rust: `
use std::io::{self, Read};

fn main() {
    let mut buffer = String::new();
    if io::stdin().read_to_string(&mut buffer).is_ok() {
        let mut words = buffer.split_whitespace();
        if let Some(n_str) = words.next() {
            if let Ok(n) = n_str.parse::<usize>() {
                let mut edges = Vec::with_capacity(n);
                for _ in 0..n {
                    if let Some(w) = words.next() {
                        if let Ok(val) = w.parse::<i32>() {
                            edges.push(val);
                        }
                    }
                }
                if let (Some(n1), Some(n2)) = (words.next(), words.next()) {
                    let node1 = n1.parse::<i32>().unwrap_or(0);
                    let node2 = n2.parse::<i32>().unwrap_or(0);
                    let res = Solution::closest_meeting_node(edges, node1, node2);
                    println!("__PLAYCODE_RESULT_START__");
                    println!("{}", res);
                    println!("__PLAYCODE_RESULT_END__");
                }
            }
        }
    }
}
`,
    },
    testCases: {
      public: [
        {
          input: "4\n2 2 3 -1\n0 1",
          expectedOutput: "2",
          description: "Basic tree convergence at node 2",
          category: "normal",
        },
        {
          input: "10\n4 4 8 -1 9 8 4 4 1 1\n5 6",
          expectedOutput: "1",
          description: "Tie between node 1 and node 4 -> picks smaller index 1",
          category: "tie_breaking",
        },
        {
          input: "4\n1 0 3 -1\n0 2",
          expectedOutput: "-1",
          description: "No common reachable node exists",
          category: "unreachable",
        },
        {
          input: "5\n1 2 3 4 -1\n2 2",
          expectedOutput: "2",
          description: "Same starting node (distance 0)",
          category: "same_node",
        },
        {
          input: "5\n1 2 3 4 -1\n0 3",
          expectedOutput: "3",
          description: "One node directly reaches the other",
          category: "direct_reach",
        },
      ],
      hidden: [
        {
          input: "6\n1 2 0 4 5 3\n0 3",
          expectedOutput: "-1",
          description: "Two disjoint cycles",
          category: "edge_cycles",
        },
        {
          input: "6\n1 2 3 4 2 -1\n0 5",
          expectedOutput: "-1",
          description: "Meeting inside cycle vs terminal dead-end",
          category: "edge_unreachable",
        },
        {
          input: "7\n2 3 4 5 6 -1 5\n0 1",
          expectedOutput: "5",
          description: "Multiple common nodes with different distances",
          category: "normal",
        },
        {
          input: "7\n2 2 3 4 5 6 -1\n0 1",
          expectedOutput: "2",
          description: "Tie between multiple nodes with equal distances",
          category: "edge_tie",
        },
        {
          input: "8\n2 2 3 4 5 3 7 6\n0 1",
          expectedOutput: "2",
          description: "Both paths converge and enter a cycle",
          category: "edge_cycle_convergence",
        },
        {
          input: "2\n-1 -1\n0 1",
          expectedOutput: "-1",
          description: "Minimal 2-node graph with no edges",
          category: "boundary_minimal",
        },
        {
          input: "2\n1 -1\n0 1",
          expectedOutput: "1",
          description: "Minimal 2-node graph with direct edge",
          category: "boundary",
        },
        {
          input: "3\n-1 -1 -1\n0 0",
          expectedOutput: "0",
          description: "Both nodes start at 0 with no edges",
          category: "edge_same_node",
        },
        {
          input: "6\n1 2 3 4 5 0\n0 3",
          expectedOutput: "0",
          description: "Pure cycle with opposite starts -> tie goes to smaller index 0",
          category: "edge_tie_cycle",
        },
        {
          input: "8\n1 2 3 -1 5 6 7 -1\n0 4",
          expectedOutput: "-1",
          description: "Two parallel linear chains that never meet",
          category: "edge_parallel",
        },
        {
          input: "5\n-1 2 3 4 -1\n1 0",
          expectedOutput: "-1",
          description: "One node is isolated, other node has path",
          category: "edge_isolated",
        },
      ],
    },
    timeComplexityHint: "O(N)",
    spaceComplexityHint: "O(N)",
  },

  "largest-sum-cycle": {
    title: "Largest Sum Cycle",
    difficulty: "Hard",
    description: `You are given a directed graph of \`N\` nodes numbered from \`0\` to \`N - 1\`, where each node has **at most one outgoing edge**.

The graph is represented with a 0-indexed array \`Edge\` of size \`N\`, indicating that there is a directed edge from node \`i\` to node \`Edge[i]\`. If there is no outgoing edge from \`i\`, then \`Edge[i] == -1\`.

Return the **maximum sum of node values** belonging to a cycle in the graph. If no cycle exists, return \`-1\`.

> **Note**: The cycle sum must include **only** the nodes that are part of the cycle, excluding any nodes on path branches leading into the cycle.`,
    tags: ["Graph", "Depth-First Search", "Cycle Detection", "Juspay"],
    constraints: [
      "1 <= N <= 10⁵",
      "-1 <= Edge[i] < N",
      "Edge[i] != i (no self-loops)",
    ],
    inputFormat: "N (number of nodes), followed by N space-separated integers representing the Edge array.",
    outputFormat: "The maximum sum of node values in a cycle, or -1 if no cycle exists.",
    examples: [
      {
        input: "5\n1 2 0 4 3",
        output: "7",
        explanation: "Cycle 0->1->2->0 has sum 0+1+2 = 3. Cycle 3->4->3 has sum 3+4 = 7. The maximum sum is 7.",
      },
      {
        input: "4\n1 2 3 -1",
        output: "-1",
        explanation: "There are no cycles in the graph.",
      },
      {
        input: "6\n1 2 3 4 2 -1",
        output: "9",
        explanation: "Cycle 2->3->4->2 has sum 2+3+4 = 9. Nodes 0 and 1 are leading into the cycle and are not part of it.",
      },
    ],
    functionSignature: {
      functionName: "largestSumCycle",
      parameters: [
        { name: "N", type: "int", description: "Total number of nodes in the graph" },
        { name: "Edge", type: "int[]", description: "Outgoing edge for each node (-1 if none)" },
      ],
      returnType: "long long",
      returnDescription: "Maximum sum of node indices belonging to any cycle, or -1 if none exists",
    },
    starterCode: {
      cpp: `#include <iostream>
#include <vector>
#include <algorithm>

using namespace std;

class Solution {
public:
    long long largestSumCycle(int N, vector<int> Edge) {
        // Write your solution here
        return -1;
    }
};

int main() {
    Solution s;

    int N;
    if (cin >> N) {
        vector<int> Edge(N);
        for (int i = 0; i < N; i++) {
            cin >> Edge[i];
        }

        cout << s.largestSumCycle(N, Edge) << "\\n";
    }

    return 0;
}
`,
      python: `class Solution:
    def largestSumCycle(self, N: int, Edge: list[int]) -> int:
        # Write your solution here
        pass

if __name__ == "__main__":
    import sys
    data = sys.stdin.read().split()
    if data:
        n = int(data[0])
        edge = [int(x) for x in data[1:n+1]]
        sol = Solution()
        print(sol.largestSumCycle(n, edge))
`,
      javascript: `/**
 * @param {number} N
 * @param {number[]} Edge
 * @return {number}
 */
function largestSumCycle(N, Edge) {
    // Write your solution here
    return -1;
}
`,
      java: `import java.util.*;

class Solution {
    public long largestSumCycle(int N, int[] Edge) {
        // Write your solution here
        return -1;
    }

    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        if (sc.hasNextInt()) {
            int n = sc.nextInt();
            int[] edge = new int[n];
            for (int i = 0; i < n; i++) edge[i] = sc.nextInt();
            Solution sol = new Solution();
            System.out.println(sol.largestSumCycle(n, edge));
        }
    }
}
`,
      go: `package main

import "fmt"

func largestSumCycle(N int, Edge []int) int64 {
	// Write your solution here
	return -1
}

func main() {
	var n int
	if _, err := fmt.Scan(&n); err == nil {
		edge := make([]int, n)
		for i := 0; i < n; i++ {
			fmt.Scan(&edge[i])
		}
		fmt.Println(largestSumCycle(n, edge))
	}
}
`,
      rust: `impl Solution {
    pub fn largest_sum_cycle(n: i32, edge: Vec<i32>) -> i64 {
        // Write your solution here
        -1
    }
}
`,
    },
    referenceSolution: {
      cpp: `#include <iostream>
#include <vector>
#include <algorithm>

using namespace std;

class Solution {
public:
    long long largestSumCycle(int N, vector<int> Edge) {
        long long ans = -1;

        // 0 = unvisited
        // 1 = currently in current path
        // 2 = completely processed
        vector<int> vis(N, 0);

        for (int i = 0; i < N; i++) {
            if (vis[i] != 0) continue;

            int node = i;

            // Traverse current path
            while (node != -1 && vis[node] == 0) {
                vis[node] = 1;
                node = Edge[node];
            }

            // Found a cycle in current path
            if (node != -1 && vis[node] == 1) {
                int st = node;
                long long tot = 0;
                do {
                    tot += node;
                    node = Edge[node];
                } while (node != st);

                ans = max(ans, tot);
            }

            // Mark current path as completely processed
            node = i;
            while (node != -1 && vis[node] == 1) {
                vis[node] = 2;
                node = Edge[node];
            }
        }

        return ans;
    }
};

int main() {
    Solution s;
    int N;
    if (cin >> N) {
        vector<int> Edge(N);
        for (int i = 0; i < N; i++) cin >> Edge[i];
        cout << s.largestSumCycle(N, Edge) << "\\n";
    }
    return 0;
}
`,
      python: `class Solution:
    def largestSumCycle(self, N: int, Edge: list[int]) -> int:
        ans = -1
        vis = [0] * N

        for i in range(N):
            if vis[i] != 0:
                continue

            node = i
            while node != -1 and vis[node] == 0:
                vis[node] = 1
                node = Edge[node]

            if node != -1 and vis[node] == 1:
                st = node
                tot = 0
                while True:
                    tot += node
                    node = Edge[node]
                    if node == st:
                        break
                ans = max(ans, tot)

            node = i
            while node != -1 and vis[node] == 1:
                vis[node] = 2
                node = Edge[node]

        return ans
`,
      javascript: `function largestSumCycle(N, Edge) {
    let ans = -1;
    const vis = new Array(N).fill(0);

    for (let i = 0; i < N; i++) {
        if (vis[i] !== 0) continue;

        let node = i;
        while (node !== -1 && vis[node] === 0) {
            vis[node] = 1;
            node = Edge[node];
        }

        if (node !== -1 && vis[node] === 1) {
            const st = node;
            let tot = 0;
            do {
                tot += node;
                node = Edge[node];
            } while (node !== st);

            ans = Math.max(ans, tot);
        }

        node = i;
        while (node !== -1 && vis[node] === 1) {
            vis[node] = 2;
            node = Edge[node];
        }
    }

    return ans;
}
`,
      java: `import java.util.*;

class Solution {
    public long largestSumCycle(int N, int[] Edge) {
        long ans = -1;
        int[] vis = new int[N];

        for (int i = 0; i < N; i++) {
            if (vis[i] != 0) continue;

            int node = i;
            while (node != -1 && vis[node] == 0) {
                vis[node] = 1;
                node = Edge[node];
            }

            if (node != -1 && vis[node] == 1) {
                int st = node;
                long tot = 0;
                do {
                    tot += node;
                    node = Edge[node];
                } while (node != st);

                ans = Math.max(ans, tot);
            }

            node = i;
            while (node != -1 && vis[node] == 1) {
                vis[node] = 2;
                node = Edge[node];
            }
        }

        return ans;
    }
}
`,
      go: `func largestSumCycle(N int, Edge []int) int64 {
	var ans int64 = -1
	vis := make([]int, N)

	for i := 0; i < N; i++ {
		if vis[i] != 0 {
			continue
		}

		node := i
		for node != -1 && vis[node] == 0 {
			vis[node] = 1
			node = Edge[node]
		}

		if node != -1 && vis[node] == 1 {
			st := node
			var tot int64 = 0
			for {
				tot += int64(node)
				node = Edge[node]
				if node == st {
					break
				}
			}
			if tot > ans {
				ans = tot
			}
		}

		node = i
		for node != -1 && vis[node] == 1 {
			vis[node] = 2
			node = Edge[node]
		}
	}

	return ans
}
`,
      rust: `impl Solution {
    pub fn largest_sum_cycle(n: i32, edge: Vec<i32>) -> i64 {
        let n = n as usize;
        let mut ans: i64 = -1;
        let mut vis = vec![0; n];

        for i in 0..n {
            if vis[i] != 0 {
                continue;
            }

            let mut node = i as i32;
            while node != -1 && vis[node as usize] == 0 {
                vis[node as usize] = 1;
                node = edge[node as usize];
            }

            if node != -1 && vis[node as usize] == 1 {
                let st = node;
                let mut tot: i64 = 0;
                loop {
                    tot += node as i64;
                    node = edge[node as usize];
                    if node == st {
                        break;
                    }
                }
                ans = ans.max(tot);
            }

            node = i as i32;
            while node != -1 && vis[node as usize] == 1 {
                vis[node as usize] = 2;
                node = edge[node as usize];
            }
        }

        ans
    }
}
`,
    },
    editorial: {
      approach: "Use 3-State Cycle Detection: 0 = unvisited, 1 = currently in active path, 2 = fully processed. When traversing from node i, mark nodes state 1. If we encounter a node already in state 1, a cycle is detected! We traverse around the cycle once from that node to compute the sum of node indices. Afterwards, mark all nodes in the path as state 2 (processed) so no node is processed more than twice.",
      timeComplexity: "O(N) — Every node transitions 0 -> 1 -> 2 at most once, and each cycle is traversed once to calculate the sum.",
      spaceComplexity: "O(N) — Visited state array of size N.",
    },
    driverCode: {
      cpp: `
int main() {
    int n;
    if (cin >> n) {
        vector<int> edge(n);
        for (int i = 0; i < n; i++) cin >> edge[i];
        Solution sol;
        long long res = sol.largestSumCycle(n, edge);
        cout << "__PLAYCODE_RESULT_START__\\n" << res << "\\n__PLAYCODE_RESULT_END__" << endl;
    }
    return 0;
}
`,
      python: `
import sys

if __name__ == "__main__":
    data = sys.stdin.read().split()
    if data:
        n = int(data[0])
        edge = [int(x) for x in data[1:n+1]]
        sol = Solution()
        res = sol.largestSumCycle(n, edge)
        print("__PLAYCODE_RESULT_START__")
        print(res)
        print("__PLAYCODE_RESULT_END__")
`,
      javascript: `
const fs = require('fs');
const input = fs.readFileSync(0, 'utf-8').trim().split(/\\s+/);
if (input.length >= 1) {
    const n = parseInt(input[0], 10);
    const edge = [];
    for (let i = 0; i < n; i++) edge.push(parseInt(input[1 + i], 10));
    const res = largestSumCycle(n, edge);
    console.log("__PLAYCODE_RESULT_START__");
    console.log(res);
    console.log("__PLAYCODE_RESULT_END__");
}
`,
      java: `
import java.util.*;

public class Main {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        if (sc.hasNextInt()) {
            int n = sc.nextInt();
            int[] edge = new int[n];
            for (int i = 0; i < n; i++) edge[i] = sc.nextInt();
            Solution sol = new Solution();
            long res = sol.largestSumCycle(n, edge);
            System.out.println("__PLAYCODE_RESULT_START__");
            System.out.println(res);
            System.out.println("__PLAYCODE_RESULT_END__");
        }
    }
}
`,
      go: `
package main

import "fmt"

func main() {
	var n int
	if _, err := fmt.Scan(&n); err == nil {
		edge := make([]int, n)
		for i := 0; i < n; i++ {
			fmt.Scan(&edge[i])
		}
		res := largestSumCycle(n, edge)
		fmt.Println("__PLAYCODE_RESULT_START__")
		fmt.Println(res)
		fmt.Println("__PLAYCODE_RESULT_END__")
	}
}
`,
      rust: `
use std::io::{self, Read};

fn main() {
    let mut buffer = String::new();
    if io::stdin().read_to_string(&mut buffer).is_ok() {
        let mut words = buffer.split_whitespace();
        if let Some(n_str) = words.next() {
            if let Ok(n) = n_str.parse::<usize>() {
                let mut edge = Vec::with_capacity(n);
                for _ in 0..n {
                    if let Some(w) = words.next() {
                        if let Ok(val) = w.parse::<i32>() {
                            edge.push(val);
                        }
                    }
                }
                let res = Solution::largest_sum_cycle(n as i32, edge);
                println!("__PLAYCODE_RESULT_START__");
                println!("{}", res);
                println!("__PLAYCODE_RESULT_END__");
            }
        }
    }
}
`,
    },
    testCases: {
      public: [
        {
          input: "5\n1 2 0 4 3",
          expectedOutput: "7",
          description: "Two disjoint cycles: sum 3 and sum 7",
          category: "normal",
        },
        {
          input: "4\n1 2 3 -1",
          expectedOutput: "-1",
          description: "Acyclic linear path",
          category: "acyclic",
        },
        {
          input: "6\n1 2 3 4 2 -1",
          expectedOutput: "9",
          description: "Chain of 0->1 leading into cycle 2->3->4->2 (nodes in cycle sum to 9)",
          category: "chain_into_cycle",
        },
        {
          input: "3\n1 2 0",
          expectedOutput: "3",
          description: "Single cycle of 3 nodes: 0->1->2->0",
          category: "single_cycle",
        },
      ],
      hidden: [
        {
          input: "7\n1 2 0 4 5 6 3",
          expectedOutput: "18",
          description: "Cycles of sizes 3 (sum 3) and 4 (sum 3+4+5+6 = 18)",
          category: "normal",
        },
        {
          input: "1\n-1",
          expectedOutput: "-1",
          description: "Single node without outgoing edge",
          category: "boundary_single",
        },
        {
          input: "5\n-1 -1 -1 -1 -1",
          expectedOutput: "-1",
          description: "All isolated nodes with no edges",
          category: "edge_isolated",
        },
        {
          input: "6\n2 2 3 4 2 -1",
          expectedOutput: "9",
          description: "Multiple incoming branches to the same cycle 2->3->4->2",
          category: "edge_multi_branch",
        },
        {
          input: "10\n1 2 3 4 5 6 7 8 9 0",
          expectedOutput: "45",
          description: "Full permutation cycle of 10 nodes (0..9)",
          category: "boundary_large_cycle",
        },
        {
          input: "8\n1 2 3 4 5 3 -1 0",
          expectedOutput: "12",
          description: "Cycle 3->4->5->3 with long chain 7->0->1->2->3 and dead end 6",
          category: "complex_graph",
        },
        {
          input: "4\n2 2 0 1",
          expectedOutput: "2",
          description: "Cycle 0->2->0 with sum 2, branches from 1 and 3",
          category: "normal",
        },
        {
          input: "6\n-1 0 1 2 3 4",
          expectedOutput: "-1",
          description: "Reverse tree with root pointing to -1",
          category: "edge_tree",
        },
        {
          input: "6\n1 2 0 4 5 1",
          expectedOutput: "3",
          description: "Path 3->4->5->1 merges into existing cycle 0->1->2->0",
          category: "edge_merge_into_cycle",
        },
        {
          input: "8\n1 0 3 2 5 4 7 6",
          expectedOutput: "13",
          description: "Four separate pairs of 2-cycles, maximum sum is 6+7=13",
          category: "multiple_cycles",
        },
      ],
    },
    timeComplexityHint: "O(N)",
    spaceComplexityHint: "O(N)",
  },

  "highest-edge-score": {
    title: "Node With Highest Edge Score",
    difficulty: "Medium",
    description: `You are given a directed graph with \`n\` nodes labeled from \`0\` to \`n - 1\`, where each node has **exactly one outgoing edge**.

The graph is represented by a given 0-indexed integer array \`edges\` of length \`n\`, where \`edges[i]\` indicates that there is a directed edge from node \`i\` to node \`edges[i]\`.

The **edge score** of a node \`i\` is defined as the sum of the labels of all the nodes that have an edge pointing to \`i\`.

Return the **node with the highest edge score**. If multiple nodes have the same edge score, return the node with the **smallest index**.`,
    tags: ["Graph", "Hash Table", "Counting", "Juspay"],
    constraints: [
      "2 <= edges.length <= 10⁵",
      "0 <= edges[i] < edges.length",
    ],
    inputFormat: "N (number of nodes), followed by N space-separated integers representing the edges array.",
    outputFormat: "The index of the node with the highest edge score (smallest index on tie).",
    examples: [
      {
        input: "6\n1 0 0 0 1 1",
        output: "1",
        explanation: "Node 0 has incoming edges from 1, 2, 3 -> score = 1+2+3 = 6. Node 1 has incoming edges from 0, 4, 5 -> score = 0+4+5 = 9. Node 1 has the highest edge score.",
      },
      {
        input: "4\n1 0 3 2",
        output: "2",
        explanation: "Node 0 score: 1. Node 1 score: 0. Node 2 score: 3. Node 3 score: 2. Highest is node 2.",
      },
      {
        input: "4\n2 0 0 1",
        output: "0",
        explanation: "Node 0 score: 1+2=3. Node 1 score: 3. Tie between node 0 and node 1 -> return smaller index 0.",
      },
    ],
    functionSignature: {
      functionName: "edgeScore",
      parameters: [
        { name: "edges", type: "int[]", description: "Outgoing directed edge for each node" },
      ],
      returnType: "int",
      returnDescription: "Index of the node with the highest edge score",
    },
    starterCode: {
      cpp: `#include <iostream>
#include <vector>
#include <algorithm>

using namespace std;

class Solution {
public:
    int edgeScore(vector<int>& edges) {
        // Write your solution here
        return 0;
    }
};

int main() {
    Solution s;

    int n;
    if (cin >> n) {
        vector<int> edges(n);
        for (int i = 0; i < n; i++) {
            cin >> edges[i];
        }

        cout << s.edgeScore(edges) << "\\n";
    }

    return 0;
}
`,
      python: `class Solution:
    def edgeScore(self, edges: list[int]) -> int:
        # Write your solution here
        pass

if __name__ == "__main__":
    import sys
    data = sys.stdin.read().split()
    if data:
        n = int(data[0])
        edges = [int(x) for x in data[1:n+1]]
        sol = Solution()
        print(sol.edgeScore(edges))
`,
      javascript: `/**
 * @param {number[]} edges
 * @return {number}
 */
function edgeScore(edges) {
    // Write your solution here
    return 0;
}
`,
      java: `import java.util.*;

class Solution {
    public int edgeScore(int[] edges) {
        // Write your solution here
        return 0;
    }

    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        if (sc.hasNextInt()) {
            int n = sc.nextInt();
            int[] edges = new int[n];
            for (int i = 0; i < n; i++) edges[i] = sc.nextInt();
            Solution sol = new Solution();
            System.out.println(sol.edgeScore(edges));
        }
    }
}
`,
      go: `package main

import "fmt"

func edgeScore(edges []int) int {
	// Write your solution here
	return 0
}

func main() {
	var n int
	if _, err := fmt.Scan(&n); err == nil {
		edges := make([]int, n)
		for i := 0; i < n; i++ {
			fmt.Scan(&edges[i])
		}
		fmt.Println(edgeScore(edges))
	}
}
`,
      rust: `impl Solution {
    pub fn edge_score(edges: Vec<i32>) -> i32 {
        // Write your solution here
        0
    }
}
`,
    },
    referenceSolution: {
      cpp: `#include <iostream>
#include <vector>
#include <algorithm>

using namespace std;

class Solution {
public:
    int edgeScore(vector<int>& edges) {
        int n = edges.size();
        vector<long long> score(n, 0);

        for (int i = 0; i < n; i++) {
            score[edges[i]] += i;
        }

        long long best = -1;
        int ans = 0;

        for (int i = 0; i < n; i++) {
            if (score[i] > best) {
                best = score[i];
                ans = i;
            }
        }

        return ans;
    }
};

int main() {
    Solution s;
    int n;
    if (cin >> n) {
        vector<int> edges(n);
        for (int i = 0; i < n; i++) cin >> edges[i];
        cout << s.edgeScore(edges) << "\\n";
    }
    return 0;
}
`,
      python: `class Solution:
    def edgeScore(self, edges: list[int]) -> int:
        n = len(edges)
        score = [0] * n

        for i in range(n):
            score[edges[i]] += i

        best = -1
        ans = 0
        for i in range(n):
            if score[i] > best:
                best = score[i]
                ans = i

        return ans
`,
      javascript: `function edgeScore(edges) {
    const n = edges.length;
    const score = new Array(n).fill(0);

    for (let i = 0; i < n; i++) {
        score[edges[i]] += i;
    }

    let best = -1;
    let ans = 0;
    for (let i = 0; i < n; i++) {
        if (score[i] > best) {
            best = score[i];
            ans = i;
        }
    }

    return ans;
}
`,
      java: `class Solution {
    public int edgeScore(int[] edges) {
        int n = edges.length;
        long[] score = new long[n];

        for (int i = 0; i < n; i++) {
            score[edges[i]] += i;
        }

        long best = -1;
        int ans = 0;

        for (int i = 0; i < n; i++) {
            if (score[i] > best) {
                best = score[i];
                ans = i;
            }
        }

        return ans;
    }
}
`,
      go: `func edgeScore(edges []int) int {
	n := len(edges)
	score := make([]int64, n)

	for i := 0; i < n; i++ {
		score[edges[i]] += int64(i)
	}

	var best int64 = -1
	ans := 0

	for i := 0; i < n; i++ {
		if score[i] > best {
			best = score[i]
			ans = i
		}
	}

	return ans
}
`,
      rust: `impl Solution {
    pub fn edge_score(edges: Vec<i32>) -> i32 {
        let n = edges.len();
        let mut score: Vec<i64> = vec![0; n];

        for i in 0..n {
            score[edges[i] as usize] += i as i64;
        }

        let mut best: i64 = -1;
        let mut ans: i32 = 0;

        for i in 0..n {
            if score[i] > best {
                best = score[i];
                ans = i as i32;
            }
        }

        ans
    }
}
`,
    },
    editorial: {
      approach: "Direct Vector Accumulation: Since node labels are contiguous 0 to N-1, we use a vector<long long> score(n, 0) instead of an unordered_map to avoid hash table overhead. In one pass, we add the source index i to score[edges[i]]. Note that the score can exceed 2^31 - 1 when N = 10^5 (up to ~5 * 10^9), so 64-bit integers are required. Finally, scanning from 0 to N-1 ensures that the strictly greater condition (> best) automatically chooses the smallest index in case of a tie.",
      timeComplexity: "O(N) — One pass to accumulate scores, and a second pass from 0 to N-1 to find the maximum.",
      spaceComplexity: "O(N) — Single score array of size N.",
    },
    driverCode: {
      cpp: `
int main() {
    int n;
    if (cin >> n) {
        vector<int> edges(n);
        for (int i = 0; i < n; i++) cin >> edges[i];
        Solution sol;
        int res = sol.edgeScore(edges);
        cout << "__PLAYCODE_RESULT_START__\\n" << res << "\\n__PLAYCODE_RESULT_END__" << endl;
    }
    return 0;
}
`,
      python: `
import sys

if __name__ == "__main__":
    data = sys.stdin.read().split()
    if data:
        n = int(data[0])
        edges = [int(x) for x in data[1:n+1]]
        sol = Solution()
        res = sol.edgeScore(edges)
        print("__PLAYCODE_RESULT_START__")
        print(res)
        print("__PLAYCODE_RESULT_END__")
`,
      javascript: `
const fs = require('fs');
const input = fs.readFileSync(0, 'utf-8').trim().split(/\\s+/);
if (input.length >= 1) {
    const n = parseInt(input[0], 10);
    const edges = [];
    for (let i = 0; i < n; i++) edges.push(parseInt(input[1 + i], 10));
    const res = edgeScore(edges);
    console.log("__PLAYCODE_RESULT_START__");
    console.log(res);
    console.log("__PLAYCODE_RESULT_END__");
}
`,
      java: `
import java.util.*;

public class Main {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        if (sc.hasNextInt()) {
            int n = sc.nextInt();
            int[] edges = new int[n];
            for (int i = 0; i < n; i++) edges[i] = sc.nextInt();
            Solution sol = new Solution();
            int res = sol.edgeScore(edges);
            System.out.println("__PLAYCODE_RESULT_START__");
            System.out.println(res);
            System.out.println("__PLAYCODE_RESULT_END__");
        }
    }
}
`,
      go: `
package main

import "fmt"

func main() {
	var n int
	if _, err := fmt.Scan(&n); err == nil {
		edges := make([]int, n)
		for i := 0; i < n; i++ {
			fmt.Scan(&edges[i])
		}
		res := edgeScore(edges)
		fmt.Println("__PLAYCODE_RESULT_START__")
		fmt.Println(res)
		fmt.Println("__PLAYCODE_RESULT_END__")
	}
}
`,
      rust: `
use std::io::{self, Read};

fn main() {
    let mut buffer = String::new();
    if io::stdin().read_to_string(&mut buffer).is_ok() {
        let mut words = buffer.split_whitespace();
        if let Some(n_str) = words.next() {
            if let Ok(n) = n_str.parse::<usize>() {
                let mut edges = Vec::with_capacity(n);
                for _ in 0..n {
                    if let Some(w) = words.next() {
                        if let Ok(val) = w.parse::<i32>() {
                            edges.push(val);
                        }
                    }
                }
                let res = Solution::edge_score(edges);
                println!("__PLAYCODE_RESULT_START__");
                println!("{}", res);
                println!("__PLAYCODE_RESULT_END__");
            }
        }
    }
}
`,
    },
    testCases: {
      public: [
        {
          input: "6\n1 0 0 0 1 1",
          expectedOutput: "1",
          description: "Example 1: Node 1 has score 9, Node 0 has score 6",
          category: "normal",
        },
        {
          input: "4\n1 0 3 2",
          expectedOutput: "2",
          description: "Node 2 receives edge from 3 (score 3)",
          category: "single_edge",
        },
        {
          input: "4\n2 0 0 1",
          expectedOutput: "0",
          description: "Tie between Node 0 (1+2=3) and Node 1 (3) -> returns smaller index 0",
          category: "tie_breaking",
        },
      ],
      hidden: [
        {
          input: "5\n0 0 0 0 0",
          expectedOutput: "0",
          description: "Star graph: all nodes point to Node 0 (score 10)",
          category: "edge_star",
        },
        {
          input: "5\n4 4 4 4 4",
          expectedOutput: "4",
          description: "All nodes point to the last node 4 (score 10)",
          category: "edge_star_last",
        },
        {
          input: "5\n1 2 3 4 0",
          expectedOutput: "0",
          description: "Cyclic shift: node 0 receives edge from 4 (score 4)",
          category: "normal",
        },
        {
          input: "2\n1 0",
          expectedOutput: "0",
          description: "Minimal 2-node graph: node 0 receives from 1 (score 1)",
          category: "boundary_minimal",
        },
        {
          input: "3\n0 1 2",
          expectedOutput: "2",
          description: "Self edges: scores are 0, 1, 2. Max is node 2 with score 2",
          category: "edge_self",
        },
        {
          input: "8\n7 7 7 7 7 7 7 7",
          expectedOutput: "7",
          description: "All 8 nodes point to node 7 (score 28)",
          category: "normal",
        },
        {
          input: "7\n1 2 3 4 5 6 0",
          expectedOutput: "0",
          description: "Permutation cycle: node 0 gets edge from 6 (score 6)",
          category: "normal",
        },
        {
          input: "6\n0 0 1 1 2 2",
          expectedOutput: "2",
          description: "Multiple incoming edges: Node 2 receives from 4 and 5 (score 9)",
          category: "normal",
        },
        {
          input: "6\n5 5 5 5 5 5",
          expectedOutput: "5",
          description: "All nodes point to node 5",
          category: "edge_star",
        },
        {
          input: "8\n3 3 3 0 0 1 1 2",
          expectedOutput: "1",
          description: "Node 1 receives incoming edges from 5 and 6 (score 11)",
          category: "normal",
        },
      ],
    },
    timeComplexityHint: "O(N)",
    spaceComplexityHint: "O(N)",
  },
};
