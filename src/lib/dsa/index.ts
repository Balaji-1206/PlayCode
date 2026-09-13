// ─── Standard DSA Data Structures ─────────────────────────────────────────────
// Definitions and serializers for common LeetCode structures:
// - ListNode (Singly Linked List)
// - TreeNode (Binary Tree)

export const DSA_DEFINITIONS: Record<string, { listNode?: string; treeNode?: string }> = {
  python: {
    listNode: `
class ListNode:
    def __init__(self, val=0, next=None):
        self.val = val
        self.next = next

def list_to_linked_list(arr):
    dummy = ListNode(0)
    curr = dummy
    for x in arr:
        curr.next = ListNode(x)
        curr = curr.next
    return dummy.next

def linked_list_to_list(head):
    res = []
    curr = head
    while curr:
        res.append(curr.val)
        curr = curr.next
    return res
`,
    treeNode: `
class TreeNode:
    def __init__(self, val=0, left=None, right=None):
        self.val = val
        self.left = left
        self.right = right

def list_to_tree(arr):
    if not arr or arr[0] is None:
        return None
    root = TreeNode(arr[0])
    queue = [root]
    i = 1
    while queue and i < len(arr):
        curr = queue.pop(0)
        if i < len(arr) and arr[i] is not None:
            curr.left = TreeNode(arr[i])
            queue.append(curr.left)
        i += 1
        if i < len(arr) and arr[i] is not None:
            curr.right = TreeNode(arr[i])
            queue.append(curr.right)
        i += 1
    return root

def tree_to_list(root):
    if not root:
        return []
    res = []
    queue = [root]
    while queue:
        curr = queue.pop(0)
        if curr:
            res.append(curr.val)
            queue.append(curr.left)
            queue.append(curr.right)
        else:
            res.append(None)
    while res and res[-1] is None:
        res.pop()
    return res
`,
  },
  cpp: {
    listNode: `
#ifndef PLAYCODE_LISTNODE
#define PLAYCODE_LISTNODE
struct ListNode {
    int val;
    ListNode *next;
    ListNode() : val(0), next(nullptr) {}
    ListNode(int x) : val(x), next(nullptr) {}
    ListNode(int x, ListNode *next) : val(x), next(next) {}
};
#endif
`,
    treeNode: `
#ifndef PLAYCODE_TREENODE
#define PLAYCODE_TREENODE
struct TreeNode {
    int val;
    TreeNode *left;
    TreeNode *right;
    TreeNode() : val(0), left(nullptr), right(nullptr) {}
    TreeNode(int x) : val(x), left(nullptr), right(nullptr) {}
    TreeNode(int x, TreeNode *left, TreeNode *right) : val(x), left(left), right(right) {}
};
#endif
`,
  },
  java: {
    listNode: `
class ListNode {
    int val;
    ListNode next;
    ListNode() {}
    ListNode(int val) { this.val = val; }
    ListNode(int val, ListNode next) { this.val = val; this.next = next; }
}
`,
    treeNode: `
class TreeNode {
    int val;
    TreeNode left;
    TreeNode right;
    TreeNode() {}
    TreeNode(int val) { this.val = val; }
    TreeNode(int val, TreeNode left, TreeNode right) {
        this.val = val;
        this.left = left;
        this.right = right;
    }
}
`,
  },
  javascript: {
    listNode: `
function ListNode(val, next) {
    this.val = (val===undefined ? 0 : val);
    this.next = (next===undefined ? null : next);
}
`,
    treeNode: `
function TreeNode(val, left, right) {
    this.val = (val===undefined ? 0 : val);
    this.left = (left===undefined ? null : left);
    this.right = (right===undefined ? null : right);
}
`,
  },
  go: {
    listNode: `
type ListNode struct {
    Val int
    Next *ListNode
}
`,
    treeNode: `
type TreeNode struct {
    Val int
    Left *TreeNode
    Right *TreeNode
}
`,
  },
  rust: {
    listNode: `
#[derive(PartialEq, Eq, Clone, Debug)]
pub struct ListNode {
  pub val: i32,
  pub next: Option<Box<ListNode>>
}

impl ListNode {
  #[inline]
  pub fn new(val: i32) -> Self {
    ListNode { next: None, val }
  }
}
`,
    treeNode: `
use std::rc::Rc;
use std::cell::RefCell;

#[derive(Debug, PartialEq, Eq)]
pub struct TreeNode {
  pub val: i32,
  pub left: Option<Rc<RefCell<TreeNode>>>,
  pub right: Option<Rc<RefCell<TreeNode>>>,
}

impl TreeNode {
  #[inline]
  pub fn new(val: i32) -> Self {
    TreeNode { val, left: None, right: None }
  }
}
`,
  },
};

/**
 * Checks if user code or driver mentions ListNode or TreeNode,
 * and returns the appropriate definitions to inject if not already defined.
 */
export function getInjectedDsaDefinitions(code: string, driverCode: string, language: string): string {
  const combined = `${code}\n${driverCode}`;
  const defs = DSA_DEFINITIONS[language];
  if (!defs) return "";

  let injection = "";

  const needsListNode =
    (combined.includes("ListNode") || combined.includes("list_node")) &&
    !code.includes("class ListNode") &&
    !code.includes("struct ListNode") &&
    !code.includes("type ListNode");

  if (needsListNode && defs.listNode) {
    injection += `${defs.listNode}\n`;
  }

  const needsTreeNode =
    (combined.includes("TreeNode") || combined.includes("tree_node")) &&
    !code.includes("class TreeNode") &&
    !code.includes("struct TreeNode") &&
    !code.includes("type TreeNode");

  if (needsTreeNode && defs.treeNode) {
    injection += `${defs.treeNode}\n`;
  }

  return injection;
}
