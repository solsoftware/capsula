---
layout: post
title:  "A Formal Approach to Explaining Capsula's Hooks and Loops"
date:   2018-07-25 16:37:15 +0200
categories: ui
---

This post explains how to create and modify hierarchy of elements by managing hierarchies of hooks and loops. How to create a valid hierarchy of hooks and loops is explained first. Then, we explain how it maps to an element structure.

Hierarchy of hooks and loops is a tree made up of hooks and loops according to the rules that follow. Hooks and loops are connected (tied) to one another using so called "ties" (ties are actually the branches in the tree).

There are two types of hooks and loops: a) connector hooks and loops and b) connecting hooks and loops.

A connector hook directly represents parent element in a parent-child relationship of elements. A connector loop directly represents child element in a parent-child relationship of elements.

(To obtain a connector hook (or loop) check ElementRef capsule.)

A connecting hook represents parent element indirectly, through a connector hook it is (directly or indirectly) tied to. A connecting loop represents child element indirectly, through a connector loop it is (directly or indirectly) tied to. A connecting hook (loop) may or may not be directly or indirectly tied to a connector hook (loop).

So, a tree of hooks and loops is made up of connector hooks and loops and connecting hooks and loops. Hooks and loops form the tree according to the following rules:

- Hook may have many children (or none). Each child must either be a hook or a loop. The ordering of hook's children is significant since it represents the ordering of elements in the corresponding section of the element structure.
- Hook can either be unparented or have exactly one parent. The parent can only be another hook.
- A connector hook must not have a parent. If it exists in the tree, it must be the root node.
- Loop can either be unparented or have exactly one parent. The parent can be another loop or a hook.
- Loop may have zero or one child. A child, if it exists, must be another loop.
- A connector loop must not have a child. If it exists in the tree, it must be a leaf node in the tree.

The same rules could be expressed more formally. Let's consider a tree of hooks and loops to be a collection of paths from the root node of the tree to each of the leaf nodes.

A valid hierarchy (tree) of hooks and loops is a collection of valid paths only.

A valid path is a chain of hooks and loops that a) spans from the root node towards the leaf node over the nodes and ties that exist between them and b) is formed according to the following rules:

- Connector hook, if it exists in the chain, can only be the first (root) node in the chain.
- Connector loop, if it exists in the chain, can only be the last (leaf) node in the chain.
- A pair of hook h and loop l where d(h) > d(l) does not exist. Here, d(n) is the distance of node n from the first (root) node of the chain.

A path is complete if the following holds:

- It is a valid path.
- The root node is a connector hook.
- The leaf node is a connector loop.

The following paths are complete (the root node is the leftmost node) (J represents a connecting hook, J' represents a connector hook, O - represents a connecting loop, O' - represents a connector loop):

- J' - O'
- J' - J - O'
- J' - O - O'
- J' - J - ... - J - O - ... - O'

A complete path represents an existing completed relationship between the parent element (represented by the connector hook) and the child element (represented by a connector loop).

The following paths are valid, but not complete:

- J
- J - ... - J
- J' - J - ... - J
- O
- O - ... - O
- O - ... - O'
- J - O
- J - ... - J - O - ... - O
- J' - J - ... - J - O - ... - O
- J - ... - J - O - ... - O'

A valid yet incomplete path represents an incomplete relationship between the parent and the child element (when either one or both of them are missing). Incomplete path would become completed as soon as it obtains both a connector hook and a connector loop. At that point the element represented by a connector hook and the element represented by the connector loop would establish a parent-child relationship.

The following paths are not valid (* represents hook, loop, or nothing at all):

- \* - O - * - J - *
- \* - O' - * - J - *
- \* - O - * - J' - *
- \* - O' - * - J' - *

Modifications in the structure of a path may or may not affect the structure of actual elements:

If a modification results in a new complete path (or paths) being formed, the elements' structure gets extended with corresponding new child element(s). If a modification results in an existing complete path (or paths) becoming incomplete, the element structure gets corresponding child element(s) removed.