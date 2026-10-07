# Commit message examples

## Good

```
feat(relation): add Studio.relation for linking nodes
```

```
fix(inspector): keep selection after canvas re-render

Re-rendering the canvas recreated node instances, so the inspector lost the
reference to the selected node. Selection is now tracked by node id.

Closes #42
```

```
refactor(tree)!: rename Studio.addNode to Studio.insertNode

BREAKING CHANGE: `Studio.addNode` is removed. Use `Studio.insertNode(parentId, node, index?)`.
```

```
build(deps): bump @angular/core to 22.2.0
```

```
test(e2e): cover inspector field editing
```

```
docs(canvas): add story for empty canvas
```

```
revert: feat(palette): add search to component palette

This reverts commit 4f1c2a9e8b7d6c5a4f3e2d1c0b9a8f7e6d5c4b3a.

Search breaks keyboard navigation in the palette; will be reworked.
```

## Bad → good

| Bad                                         | Good                                                  | Problem                             |
| ------------------------------------------- | ----------------------------------------------------- | ----------------------------------- |
| `ui: folders-sidebar`                       | `feat(folders-sidebar): add folders sidebar`          | unknown type, no description        |
| `feat: added edit sidebar`                  | `feat(inspector): add edit sidebar`                   | past tense, no scope                |
| `refactor: global refactoring, part 1 / 2`  | `refactor(registry): extract component registry`      | vague, not atomic                   |
| `fix: Fixed bug.`                           | `fix(tree): prevent duplicate ids when cloning nodes` | past tense, capital, period, vague  |
| `Feat(Canvas): Add drag handle`             | `feat(canvas): add drag handle to node`               | wrong case                          |
| `feat(canvas):add drag handle`              | `feat(canvas): add drag handle to node`               | missing space after colon           |
| `feat(tree)!: remove addNode`               | + footer `BREAKING CHANGE: … use insertNode …`        | breaking without migration footer   |
| `fix(canvas,inspector): sync selection`     | two commits, or `fix: sync selection between …`       | multiple scopes                     |
| `style(canvas): change node border color`   | `fix(canvas): restore node border contrast`           | visual change is not `style`        |
| `refactor(inspector): fix enum field crash` | `fix(inspector): prevent crash on empty enum options` | user-visible fix hidden as refactor |
