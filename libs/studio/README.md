# @dynamic-ui/studio

Core library for the Dynamic UI toolkit: **logic only, no UI**.

This package contains everything the studio needs to describe components, build and validate node trees, model cross-node relations, and serialize the result to a canonical DSL. It has no DOM dependencies, no framework dependencies, and does not render anything.

For the overall project vision, see the [root README](../../README.md).

---

## What's in this package

- **Component registration API** — primitives for declaring the shape of each component's props and relations.
- **Node and tree model** — the single-shape node contract that the entire editor manipulates.
- **Relations** — a node's conditional links to other nodes: a flat list of `{ target, operator, value? }` rules combined with AND or OR.
- **Canonical DSL** — serialization and deserialization of the node tree into pure JSON.
- **Validation** — schema-level and instance-level checks (type correctness, broken references, containers receiving children they cannot hold).

## What's NOT in this package

- The **visual editor UI** (canvas, sidebar, gear panel). Lives in framework-specific packages — currently [`@dynamic-ui/ngx-studio`](../ngx-studio/README.md) for Angular; React/Vue implementations are planned.
- **Adapters** to runtime form libraries. Each adapter is a separate package.
- **Live form preview.** The core does not know how to render a form; that is strictly the adapter's job.
- Anything DOM- or framework-specific. The core is pure TypeScript.

## Public API surface

Only **one** class is exported — `Studio`. It is both:

- A **facade** — a `Studio` instance owns the registry, the node tree, selection, and subscriptions.
- A **DSL namespace** — all schema factories (`Studio.text()`, `Studio.relation()`, …) are static methods on it, along with `Studio.defineComponent()`.

Internal classes (`Registry`, `Store`, `Tree`) are **not** exported. The only other export is `StudioError` for `instanceof` discrimination plus the TypeScript types consumers need.

### Why UI is not here, and not web components

The UI needs to be stylable by whoever embeds the studio — brand colors, spacing, typography, dark mode, you name it. Web components isolate styles behind Shadow DOM, and real-world styling then requires `::part`, `exportparts`, and manual CSS custom property wiring. That becomes a chore the moment anyone wants to make the studio look like it belongs in their product.

Shipping separate UI packages per framework lets consumers style the studio with the mechanisms they already use (CSS modules, Tailwind, styled-components, Angular view encapsulation, SFC `<style>` blocks). The core stays framework-agnostic; UI packages stay stylable.

---

## Mental model

Every element in a tree is a **node**, and every node has exactly the same shape:

```ts
type Node = {
  id: string // stable instance identifier
  name: string // registered component title
  fieldName?: string // key of the value in the output
  props: object // static values the component consumes
  relations: object // dynamic links to other nodes
  children?: Node[] // only present if the component is a container
}
```

This is the entire contract. The core has no notion of "input", "field", "section", "validator", "layout", or "form". Those meanings exist exclusively in the component registrations provided by the developer and in the adapter that interprets the output DSL.

### Why only four fields

Keeping the model this small is a deliberate design discipline. Every additional concept (slots, groups, fieldsets, forms-as-first-class, ...) would leak domain assumptions into the core and tie it to form-shaped use cases. We want the same core to build forms, tables, dashboards, email templates, or anything else that is a tree of configurable components.

If a concept can be expressed as "another component the developer registers", it belongs in user-land, not in the core.

---

## Registering components

A developer tells the studio which components exist, what props each one accepts, and what relations each one can express. The studio uses this metadata to render the sidebar palette and the per-node gear panel.

```ts
import { Studio } from '@dynamic-ui/studio'

const textInput = Studio.defineComponent({
  title: 'Controls/TextInput',

  props: {
    label: Studio.text(),
    placeholder: Studio.text(),
    disabled: Studio.checkbox(),
    maxLength: Studio.decimal()
  },

  relations: {
    visible: Studio.relation({ returns: 'boolean' }),
    disabled: Studio.relation({ returns: 'boolean' }),
    required: Studio.relation({ returns: 'boolean' })
  }
})
```

That's a complete component definition. The core has no built-in knowledge that this is a "text input"; from its point of view it's just a leaf component (not a container) with a declared prop shape and three available relations.

The display label is derived from the last `/`-separated segment of `title` (`Controls/TextInput` → `TextInput`), so the title is the single source for both identity and the palette hierarchy. A prop's label in the gear panel is always derived from its key (`maxLength` → `Max Length`); primitives have no `label` option.

### Adapters

An adapter maps the AST onto whatever the host needs — framework props, a backend schema, generated code. It is a single function, and the studio never interprets its result:

```ts
const reactProps = Studio.defineAdapter({ map: root => toReactTree(root) })
```

The UI package runs registered adapters against the live tree and shows their output next to the AST (see `@dynamic-ui/ngx-studio`).

### Containers

Any component that should accept children sets `container: true`:

```ts
const stepper = Studio.defineComponent({
  title: 'Containers/Stepper',

  container: true,

  props: {
    orientation: Studio.enum(['horizontal', 'vertical'])
  }
})
```

There is no concept of "slot" or "named region". If you need a container with structurally distinct child positions (e.g., an accordion with multiple panels), you register the composition explicitly: a parent container with its own dedicated child components, which in turn accept their own children. See [Composition patterns](#composition-patterns) below.

---

## Instantiating the studio

Once components are defined, create a `Studio` with them. The studio owns the root container, so `root` is optional — omit it for an empty canvas, or pass a plain description (the studio builds the nodes and ids) to seed content. From this point on, the UI package (or any consumer) talks to the studio instance directly — mutations, inspection, subscriptions:

```ts
import { Studio } from '@dynamic-ui/studio'

// Empty canvas — the studio creates the root for you.
const studio = new Studio({ components: [form, textInput, button] })

// …or seed it with a starting tree:
// new Studio({ components, root: { name: 'Containers/Form', children: [...] } })

// Palette: list every registered component, look one up by name.
studio.getComponents()
studio.getComponent('Controls/TextInput')

// Canvas: walk the tree, inspect a specific node.
studio.root
studio.findNode(someId)
studio.parentOf(someId)

// Mutations — applied to the immutable tree; `state$` emits a fresh snapshot after each.
const fieldId = studio.addNode(studio.root.id, { name: 'Controls/TextInput' })
studio.setProp(fieldId, ['label'], 'Email')
studio.setRelation(fieldId, 'required', {
  combine: 'and',
  rules: [{ target: 'role-id', operator: 'equals', value: 'admin' }]
})

// Selection and reactivity — UI binds to `state$` (RxJS) to re-render on changes.
studio.select(fieldId)
const sub = studio.state$.subscribe(snapshot => renderCanvas(snapshot))
```

That is the entire public API. `Registry` and `Tree` live inside the facade and are not exported — swapping their implementations is a non-breaking change.

---

## The `Studio.*` primitives

Primitives are used in two places: to declare the shape of **props** on a component, and (as `Studio.relation`) to declare the shape of **relations**.

| Primitive                          | Purpose                                                                           |
| ---------------------------------- | --------------------------------------------------------------------------------- |
| `Studio.text()`                    | Single-line string value.                                                         |
| `Studio.decimal()`                 | Numeric value.                                                                    |
| `Studio.checkbox()`                | Boolean value.                                                                    |
| `Studio.select()`                  | Single choice from a dynamic set of options.                                      |
| `Studio.enum([...])`               | Single choice from a fixed set of options defined at registration time.           |
| `Studio.code()`                    | JSON source, edited in a code editor.                                             |
| `Studio.time()`                    | Time of day, stored as `HH:mm`.                                                   |
| `Studio.date({ range?, format? })` | Calendar date (`yyyy-MM-dd`), or `{ start, end }` when `range` is true.           |
| `Studio.group({ ... })`            | Nested object of primitives. Useful for grouping related props in the gear panel. |
| `Studio.relation(options?)`        | A conditional link to other nodes. See [Relations](#relations).                   |

Every primitive also accepts `hint` (helper text under the field), e.g. `Studio.text({ hint: 'Name in format Name - Surname' })`.

Each primitive produces a descriptor the studio uses to:

1. Render the appropriate input in the gear panel.
2. Validate values on save.
3. Serialize the configured value into the DSL.

The primitive set is intentionally small. The core does not try to cover every possible input type; richer widgets (color pickers, rich-text editors) belong in the UI packages or in developer-provided custom primitives.

---

## Props vs relations

Every component declares two separate bags: `props` and `relations`. They are different in kind, not just in name.

- **`props`** are values the component **consumes directly**. The adapter copies them into the rendered component. Example: `label`, `placeholder`, `maxLength`, `multiple`.
- **`relations`** describe **behavior around the component** that depends on other nodes. The adapter wires them up reactively. Example: `visible`, `disabled`, `required`, a computed `value`.

The rule of thumb: **does the component itself need to know this value to render?** If yes → `props`. If no (the surrounding runtime applies it) → `relations`.

Separating these two is what keeps the adapter clean: props are a simple projection, relations are wired reactively. Mixing them in one bag would force every adapter to re-discover the distinction at runtime.

### When a prop and a relation overlap

Sometimes the same semantic (e.g., `disabled`) can be either static or dynamic. The core allows both to be declared, and defines the override rule:

> If both `props.X` and `relations.X` are set on an instance, the relation wins.

Adapters implement this once; consumers get both ergonomics (set a static boolean when that's enough) and expressiveness (replace with a relation when needed).

---

## Relations

Relations are first-class. They are the mechanism by which a dynamic UI stays dynamic.

### Return types

Every relation declares what it produces:

| `returns`          | Meaning                         | Typical use                                   |
| ------------------ | ------------------------------- | --------------------------------------------- |
| `'boolean'`        | Condition.                      | `visible`, `disabled`, `required`.            |
| `'value'`          | Computed value of a given type. | `placeholder = "Hi, " + firstName.value`.     |
| `'nodeReference'`  | A reference to one other node.  | "This field depends on that field."           |
| `'nodeReferences'` | A list of node references.      | "These fields together determine the result." |

### An instance is a flat list of rules

A relation set on a node is just its conditions and how they combine — no nested expression tree:

```ts
interface RelationInstance {
  combine: 'and' | 'or'
  rules: { target: NodeId; operator: RuleOperator; value?: JsonValue }[]
}
```

```json
{
  "combine": "or",
  "rules": [
    { "target": "country-5", "operator": "equals", "value": "US" },
    { "target": "email-3", "operator": "isEmpty" }
  ]
}
```

The core does not evaluate this — it only records it. What a relation name (`visible`) and an operator (`equals`) mean is entirely the adapter's call; the adapter maps each rule to whatever its runtime needs.

### Operators

`equals`, `notEquals`, `greaterThan`, `greaterThanOrEqual`, `lessThan`, `lessThanOrEqual`, `isOneOf` (take a value), `isEmpty`, `isNotEmpty`, `isValid`, `isInvalid`, `isTouched`, `isUntouched` (take none). The set is exported as `RELATION_OPERATORS`, each with a label and its value shape (`none` / `single` / `list`).

### Configuring a relation at registration

```ts
Studio.relation({
  returns: 'boolean',

  // Studio-time constraints on what the gear panel offers; not part of the output.
  targetFilter: {
    kinds: ['Controls/TextInput', 'Controls/Dropdown'],
    scope: 'siblings' // 'siblings' | 'any'
  },

  // Whitelist of operators shown in the UI. Omit to allow all.
  operators: ['equals', 'notEquals', 'isEmpty']
})
```

## Composition patterns

The core deliberately has no slots, no named regions, no "input" vs "container" dichotomy — only components that may or may not accept children.

Any structural pattern reduces to composition:

**Stepper:** a `Stepper` container that accepts `Step` children. `Step` is itself a container that accepts arbitrary form controls.

**Accordion:** an `Accordion` container that accepts `AccordionPanel` children. `AccordionPanel` is a container that accepts arbitrary content.

**Card with header / body / footer:** a `Card` container that accepts a `CardHeader`, a `CardBody`, and a `CardFooter` (each registered as its own component).

**If/Else:** an `IfCondition` component with a boolean relation, whose children are rendered only when the condition holds. A sibling `ElseBranch` component captures the fallback.

Each of these is "just a component" from the core's point of view. The developer encodes the semantics by naming components, choosing child kinds, and writing the adapter.

---

## Identifiers

Two different identifiers exist, and they must not be conflated:

- **`id`** — the stable instance identifier assigned by the studio when a node is created. Never shown to the end user, never editable, never reused. Everything that references a node (relations, parent-child, selection state, undo history) uses this id.
- **`name`** — the title of the registered component the node is an instance of (e.g., `Controls/TextInput`). Set by the developer at registration time via `title`.
- **`fieldName`** — optional key under which the node's value is stored in the final output (e.g., `firstName`). Edited in the gear panel for every component; whitespace is stored as `_` (`first name` → `first_name`).

---

## Canonical DSL output

The studio serializes the tree to pure JSON:

```json
{
  "schemaVersion": 1,
  "root": {
    "id": "root-1",
    "name": "Containers/Form",
    "props": {},
    "relations": {},
    "children": [
      {
        "id": "field-2",
        "name": "Controls/TextInput",
        "props": {
          "label": "Email",
          "placeholder": "you@example.com",
          "maxLength": 120
        },
        "relations": {
          "required": {
            "combine": "and",
            "rules": [{ "target": "role-3", "operator": "equals", "value": "admin" }]
          }
        }
      },
      {
        "id": "role-3",
        "name": "Controls/Dropdown",
        "props": {
          "label": "Role",
          "options": ["user", "admin"]
        },
        "relations": {}
      }
    ]
  }
}
```

Guarantees of the DSL:

1. **Pure JSON.** No functions, no `Symbol`, no circular references, no framework-specific values.
2. **Versioned.** The `schemaVersion` field exists from day one so future migrations are mechanical.
3. **Validatable.** The DSL has a published JSON Schema; adapters validate inputs before interpreting.
4. **Portable.** The same DSL feeds any adapter. Nothing in it is React-specific, Angular-specific, or tied to any form library.

---

## Adapters

An adapter is a function from DSL → working UI in some target framework/library.

The adapter contract is intentionally minimal — in essence:

```ts
interface Adapter {
  render(dsl: CanonicalDsl, host: HostContext): RuntimeHandle
}
```

What an adapter does:

- Walks the node tree.
- Maps each `name` to a concrete component in the host framework.
- Projects `props` directly onto the component.
- Walks each relation's rules and wires them up using the host runtime's reactivity (RxJS, signals, hooks, computed, whatever).
- Returns a handle the host application can mount, read values from, and submit.

What an adapter does **not** do:

- Interpret component semantics the core doesn't know about. The adapter is only responsible for faithful translation, not for inventing missing features.
- Report runtime limitations as bugs in the core. If the target form library cannot express something the DSL describes, the adapter either translates with a workaround, emits a warning, or clearly documents the limitation.

Reference adapters will live in `libs/adapters/*`.

---

## Architectural invariants

These are the rules the core will not break, and reviewers should push back on any PR that erodes them:

### 1. Studio renders abstract DSL cards, not real forms

The canvas shows configured nodes as cards (name, labels, summary of relations). It never attempts to render the actual UI of registered components. The moment the core tries to do this, it has to pick a runtime, and the whole adapter abstraction collapses.

Live preview is the job of an **external plugin** that pairs a specific UI package with a specific adapter. The core is unaware of it.

### 2. The DSL is pure data

No function references, no closures, no `Symbol`, no class instances in the serialized output. Anything that can't survive `JSON.stringify` + `JSON.parse` round-trip does not belong in the DSL. This is what keeps the DSL portable across frameworks, storable in databases, and reviewable in diffs.

### 3. Runtime capability mismatches are adapter concerns

The DSL may describe behaviors that a particular runtime cannot express declaratively. That is not a flaw in the DSL; it is a limit of the runtime. Adapters document the mismatch; the core keeps its full expressiveness.

### 4. "Everything is a component"

No special categories: no inputs, no containers-as-a-separate-concept, no slots, no validator primitives, no form-level magic. Any such concept is expressed by a developer-registered component (plus its props, relations, and the `container` flag).

---

## Status

Early. The public API will change as the primitives, relations, and DSL stabilize. Do not depend on this package in production yet.

## License

MIT.
