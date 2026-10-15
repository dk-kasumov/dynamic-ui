import * as _dynamic_ui_ngx_studio from '@dynamic-ui/ngx-studio';
import * as _dynamic_ui_studio from '@dynamic-ui/studio';
import { Node, Studio, StudioAdapter, ComponentDefinition, NodeId, NodeLinks, FieldError, NewNode, NodeMetaPatch, RelationInstance, TargetFilter, Primitive, TextPrimitive, DecimalPrimitive, CheckboxPrimitive, EnumPrimitive, SelectPrimitive } from '@dynamic-ui/studio';
import * as _angular_core from '@angular/core';
import { TemplateRef, OnInit, AfterViewInit, OnDestroy, Signal } from '@angular/core';
import Sortable, { Options } from 'sortablejs';
import { ErrorStateMatcher } from '@angular/material/core';
import { MatChipInputEvent } from '@angular/material/chips';

type ThemePreference = 'system' | 'light' | 'dark';
type ResolvedTheme = 'light' | 'dark';
declare class StudioTheme {
    #private;
    readonly preference: _angular_core.Signal<ThemePreference>;
    readonly resolved: _angular_core.Signal<ResolvedTheme>;
    constructor();
    set(preference: ThemePreference): void;
    static ɵfac: _angular_core.ɵɵFactoryDeclaration<StudioTheme, never>;
    static ɵprov: _angular_core.ɵɵInjectableDeclaration<StudioTheme>;
}

interface StudioPreviewContext {
    $implicit: Node;
    outputs: Record<string, unknown>;
}
declare class StudioPreviewDirective {
    readonly template: TemplateRef<StudioPreviewContext>;
    static ngTemplateContextGuard(_directive: StudioPreviewDirective, context: unknown): context is StudioPreviewContext;
    static ɵfac: _angular_core.ɵɵFactoryDeclaration<StudioPreviewDirective, never>;
    static ɵdir: _angular_core.ɵɵDirectiveDeclaration<StudioPreviewDirective, "ng-template[dsStudioPreview]", never, {}, {}, never, never, true, never>;
}

declare class NgxStudioComponent implements OnInit {
    #private;
    protected readonly theme: StudioTheme;
    readonly studio: _angular_core.InputSignal<Studio>;
    readonly adapters: _angular_core.InputSignal<Readonly<Record<string, StudioAdapter<unknown>>>>;
    readonly previewSlot: _angular_core.Signal<StudioPreviewDirective | undefined>;
    readonly paletteComponents: _angular_core.Signal<readonly ComponentDefinition<string, Record<string, _dynamic_ui_studio.Primitive<string, unknown>>, Record<string, _dynamic_ui_studio.RelationDescriptor>, Record<string, unknown>>[]>;
    readonly view: _angular_core.Signal<_dynamic_ui_ngx_studio.StudioView>;
    readonly inspecting: _angular_core.Signal<boolean>;
    readonly picking: _angular_core.Signal<boolean>;
    constructor();
    ngOnInit(): void;
    static ɵfac: _angular_core.ɵɵFactoryDeclaration<NgxStudioComponent, never>;
    static ɵcmp: _angular_core.ɵɵComponentDeclaration<NgxStudioComponent, "ds-ngx-studio", never, { "studio": { "alias": "studio"; "required": true; "isSignal": true; }; "adapters": { "alias": "adapters"; "required": false; "isSignal": true; }; }, {}, ["previewSlot"], never, true, never>;
}

interface DsSortableDropEvent {
    from: HTMLElement;
    to: HTMLElement;
    oldIndex: number;
    newIndex: number;
    item: HTMLElement;
    isClone: boolean;
}
declare class DsSortableDirective implements AfterViewInit, OnDestroy {
    #private;
    readonly options: _angular_core.InputSignal<Partial<Sortable.Options>>;
    readonly dsSortableDrop: _angular_core.OutputEmitterRef<DsSortableDropEvent>;
    ngAfterViewInit(): void;
    ngOnDestroy(): void;
    static ɵfac: _angular_core.ɵɵFactoryDeclaration<DsSortableDirective, never>;
    static ɵdir: _angular_core.ɵɵDirectiveDeclaration<DsSortableDirective, "[dsSortable]", never, { "options": { "alias": "options"; "required": false; "isSignal": true; }; }, { "dsSortableDrop": "dsSortableDrop"; }, never, never, true, never>;
}

declare class StudioFacade {
    #private;
    readonly root: _angular_core.Signal<Node | null>;
    readonly selectedId: _angular_core.Signal<NodeId | null>;
    readonly links: _angular_core.Signal<Map<NodeId, NodeLinks>>;
    readonly fieldErrors: _angular_core.Signal<ReadonlyMap<NodeId, FieldError[]>>;
    readonly errorCount: _angular_core.Signal<number>;
    readonly nodesWithErrors: _angular_core.Signal<NodeId[]>;
    readonly picking: _angular_core.Signal<boolean>;
    readonly inspectedId: _angular_core.Signal<NodeId | null>;
    readonly inspectedNode: _angular_core.Signal<Node | null>;
    readonly treeSortOptions: Partial<Options>;
    bind(studio: Studio): void;
    nodeSignal(id: () => NodeId): _angular_core.Signal<Node>;
    component(name: string): ComponentDefinition | undefined;
    iconOf(node: Node): string;
    addNode(parentId: NodeId, input: NewNode, index?: number): NodeId;
    moveNode(id: NodeId, newParentId: NodeId, index?: number): void;
    removeNode(id: NodeId): void;
    setProp(id: NodeId, path: readonly string[], value: unknown): void;
    setMeta(id: NodeId, patch: NodeMetaPatch): void;
    select(id: NodeId | null): void;
    inspect(id: NodeId): void;
    closeInspector(): void;
    setRelation(id: NodeId, name: string, value: RelationInstance): void;
    removeRelation(id: NodeId, name: string): void;
    relationTargets(nodeId: NodeId, filter?: TargetFilter): Node[];
    runAdapter<Output>(adapter: StudioAdapter<Output>): Output;
    nodeLabel(id: NodeId): string;
    linksOf(id: NodeId): NodeLinks;
    errorsOf(id: NodeId): readonly FieldError[];
    describeNode(id: NodeId): {
        name: string;
        type: string | null;
    };
    highlight(ids: Iterable<NodeId>): void;
    clearHighlight(): void;
    isHighlighted(id: NodeId): boolean;
    pickable(id: NodeId): boolean;
    startPick(eligible: Iterable<NodeId>, resolve: (id: NodeId) => void): void;
    resolvePick(id: NodeId): void;
    cancelPick(): void;
    applyDrop(evt: DsSortableDropEvent): boolean;
    static ɵfac: _angular_core.ɵɵFactoryDeclaration<StudioFacade, never>;
    static ɵprov: _angular_core.ɵɵInjectableDeclaration<StudioFacade>;
}

declare class CanvasComponent {
    readonly facade: StudioFacade;
    static ɵfac: _angular_core.ɵɵFactoryDeclaration<CanvasComponent, never>;
    static ɵcmp: _angular_core.ɵɵComponentDeclaration<CanvasComponent, "ds-canvas", never, {}, {}, never, never, true, never>;
}

interface LinkBadge {
    direction: 'out' | 'in';
    icon: string;
    ids: NodeId[];
    hint: string;
}
declare class CanvasNodeComponent {
    readonly facade: StudioFacade;
    readonly nodeId: _angular_core.InputSignal<NodeId>;
    readonly node: _angular_core.Signal<_dynamic_ui_studio.Node>;
    readonly component: _angular_core.Signal<_dynamic_ui_studio.ComponentDefinition<string, Record<string, _dynamic_ui_studio.Primitive<string, unknown>>, Record<string, _dynamic_ui_studio.RelationDescriptor>, Record<string, unknown>>>;
    readonly container: _angular_core.Signal<boolean>;
    readonly dropHint: _angular_core.Signal<string>;
    readonly isSelected: _angular_core.Signal<boolean>;
    readonly isInspected: _angular_core.Signal<boolean>;
    readonly pickable: _angular_core.Signal<boolean>;
    readonly icon: _angular_core.Signal<string>;
    readonly errors: _angular_core.Signal<readonly _dynamic_ui_studio.FieldError[]>;
    readonly errorHint: _angular_core.Signal<string>;
    readonly subtitle: _angular_core.Signal<string | undefined>;
    readonly linkBadges: _angular_core.Signal<LinkBadge[]>;
    onSelect(event: MouseEvent): void;
    onEdit(event: MouseEvent): void;
    onRemove(event: MouseEvent): void;
    static ɵfac: _angular_core.ɵɵFactoryDeclaration<CanvasNodeComponent, never>;
    static ɵcmp: _angular_core.ɵɵComponentDeclaration<CanvasNodeComponent, "ds-canvas-node", never, { "nodeId": { "alias": "nodeId"; "required": true; "isSignal": true; }; }, {}, never, never, true, never>;
}

interface FolderItem {
    id: string | number;
    name: string;
    [key: string]: unknown;
}
interface Folder {
    id: string | number;
    name: string;
    children?: Folder[];
    items?: FolderItem[];
}

declare class CanvasPaletteComponent {
    readonly facade: StudioFacade;
    readonly components: _angular_core.InputSignal<readonly ComponentDefinition<string, Record<string, _dynamic_ui_studio.Primitive<string, unknown>>, Record<string, _dynamic_ui_studio.RelationDescriptor>, Record<string, unknown>>[]>;
    readonly folders: _angular_core.Signal<Folder[]>;
    readonly iconOrDefault: (icon: string | undefined, def: ComponentDefinition) => string;
    readonly isContainer: (def: ComponentDefinition) => boolean;
    readonly sortOptions: Partial<Options>;
    defOf(item: FolderItem): ComponentDefinition;
    static ɵfac: _angular_core.ɵɵFactoryDeclaration<CanvasPaletteComponent, never>;
    static ɵcmp: _angular_core.ɵɵComponentDeclaration<CanvasPaletteComponent, "ds-canvas-palette", never, { "components": { "alias": "components"; "required": true; "isSignal": true; }; }, {}, never, never, true, never>;
}

declare class StudioHeaderComponent {
    readonly facade: StudioFacade;
    highlightErrors(): void;
    static ɵfac: _angular_core.ɵɵFactoryDeclaration<StudioHeaderComponent, never>;
    static ɵcmp: _angular_core.ɵɵComponentDeclaration<StudioHeaderComponent, "ds-studio-header", never, {}, {}, never, never, true, never>;
}

interface InspectorFieldChange {
    path: readonly string[];
    value: unknown;
}

declare class InspectorComponent {
    readonly facade: StudioFacade;
    readonly node: Signal<Node>;
    readonly definition: Signal<_dynamic_ui_studio.ComponentDefinition<string, Record<string, _dynamic_ui_studio.Primitive<string, unknown>>, Record<string, _dynamic_ui_studio.RelationDescriptor>, Record<string, unknown>>>;
    readonly hasRelations: Signal<boolean>;
    readonly errors: Signal<readonly _dynamic_ui_studio.FieldError[]>;
    onEscape(): void;
    close(): void;
    onPropChange(id: NodeId, change: InspectorFieldChange): void;
    static ɵfac: _angular_core.ɵɵFactoryDeclaration<InspectorComponent, never>;
    static ɵcmp: _angular_core.ɵɵComponentDeclaration<InspectorComponent, "ds-inspector", never, {}, {}, never, never, true, never>;
}

declare class PropsFormComponent {
    readonly definition: _angular_core.InputSignal<ComponentDefinition<string, Record<string, Primitive<string, unknown>>, Record<string, _dynamic_ui_studio.RelationDescriptor>, Record<string, unknown>>>;
    readonly values: _angular_core.InputSignal<Record<string, unknown>>;
    readonly errors: _angular_core.InputSignal<readonly FieldError[]>;
    readonly changed: _angular_core.OutputEmitterRef<InspectorFieldChange>;
    readonly entries: _angular_core.Signal<{
        key: string;
        primitive: Primitive<string, unknown>;
        label: string;
    }[]>;
    valueOf(key: string): unknown;
    static ɵfac: _angular_core.ɵɵFactoryDeclaration<PropsFormComponent, never>;
    static ɵcmp: _angular_core.ɵɵComponentDeclaration<PropsFormComponent, "ds-props-form", never, { "definition": { "alias": "definition"; "required": true; "isSignal": true; }; "values": { "alias": "values"; "required": true; "isSignal": true; }; "errors": { "alias": "errors"; "required": false; "isSignal": true; }; }, { "changed": "changed"; }, never, never, true, never>;
}

type InspectorMetaChange = NodeMetaPatch;
declare class MetaFieldsComponent {
    #private;
    readonly node: _angular_core.InputSignal<Node>;
    readonly definition: _angular_core.InputSignal<ComponentDefinition<string, Record<string, _dynamic_ui_studio.Primitive<string, unknown>>, Record<string, _dynamic_ui_studio.RelationDescriptor>, Record<string, unknown>>>;
    readonly changed: _angular_core.OutputEmitterRef<NodeMetaPatch>;
    readonly iconValue: _angular_core.Signal<string>;
    readonly fieldNameValue: _angular_core.Signal<string>;
    readonly defaultIcon: _angular_core.Signal<string>;
    readonly effectiveIcon: _angular_core.Signal<string>;
    onIconInput(event: Event): void;
    onFieldNameInput(event: Event): void;
    static ɵfac: _angular_core.ɵɵFactoryDeclaration<MetaFieldsComponent, never>;
    static ɵcmp: _angular_core.ɵɵComponentDeclaration<MetaFieldsComponent, "ds-meta-fields", never, { "node": { "alias": "node"; "required": true; "isSignal": true; }; "definition": { "alias": "definition"; "required": true; "isSignal": true; }; }, { "changed": "changed"; }, never, never, true, never>;
}

declare class FieldHostComponent implements ErrorStateMatcher {
    readonly primitive: _angular_core.InputSignal<Primitive<string, unknown>>;
    readonly value: _angular_core.InputSignal<unknown>;
    readonly label: _angular_core.InputSignal<string>;
    readonly path: _angular_core.InputSignal<readonly string[]>;
    readonly errors: _angular_core.InputSignal<readonly FieldError[]>;
    readonly messages: _angular_core.Signal<string[]>;
    isErrorState(): boolean;
    readonly changed: _angular_core.OutputEmitterRef<InspectorFieldChange>;
    readonly groupEntries: _angular_core.Signal<{
        key: string;
        primitive: Primitive<string, unknown>;
        label: string;
    }[]>;
    emit(value: unknown): void;
    groupValueOf(key: string): unknown;
    childPath(key: string): string[];
    static ɵfac: _angular_core.ɵɵFactoryDeclaration<FieldHostComponent, never>;
    static ɵcmp: _angular_core.ɵɵComponentDeclaration<FieldHostComponent, "ds-field-host", never, { "primitive": { "alias": "primitive"; "required": true; "isSignal": true; }; "value": { "alias": "value"; "required": false; "isSignal": true; }; "label": { "alias": "label"; "required": true; "isSignal": true; }; "path": { "alias": "path"; "required": true; "isSignal": true; }; "errors": { "alias": "errors"; "required": false; "isSignal": true; }; }, { "changed": "changed"; }, never, never, true, never>;
}

declare class TextFieldComponent {
    readonly label: _angular_core.InputSignal<string>;
    readonly primitive: _angular_core.InputSignal<TextPrimitive>;
    readonly value: _angular_core.InputSignal<string | undefined>;
    readonly errors: _angular_core.InputSignal<readonly string[]>;
    readonly valueChange: _angular_core.OutputEmitterRef<string>;
    onInput(event: Event): void;
    static ɵfac: _angular_core.ɵɵFactoryDeclaration<TextFieldComponent, never>;
    static ɵcmp: _angular_core.ɵɵComponentDeclaration<TextFieldComponent, "ds-text-field", never, { "label": { "alias": "label"; "required": true; "isSignal": true; }; "primitive": { "alias": "primitive"; "required": true; "isSignal": true; }; "value": { "alias": "value"; "required": false; "isSignal": true; }; "errors": { "alias": "errors"; "required": false; "isSignal": true; }; }, { "valueChange": "valueChange"; }, never, never, true, never>;
}

declare class DecimalFieldComponent {
    readonly label: _angular_core.InputSignal<string>;
    readonly primitive: _angular_core.InputSignal<DecimalPrimitive>;
    readonly value: _angular_core.InputSignal<number | undefined>;
    readonly errors: _angular_core.InputSignal<readonly string[]>;
    readonly valueChange: _angular_core.OutputEmitterRef<number | null>;
    onInput(event: Event): void;
    static ɵfac: _angular_core.ɵɵFactoryDeclaration<DecimalFieldComponent, never>;
    static ɵcmp: _angular_core.ɵɵComponentDeclaration<DecimalFieldComponent, "ds-decimal-field", never, { "label": { "alias": "label"; "required": true; "isSignal": true; }; "primitive": { "alias": "primitive"; "required": true; "isSignal": true; }; "value": { "alias": "value"; "required": false; "isSignal": true; }; "errors": { "alias": "errors"; "required": false; "isSignal": true; }; }, { "valueChange": "valueChange"; }, never, never, true, never>;
}

declare class CheckboxFieldComponent {
    readonly label: _angular_core.InputSignal<string>;
    readonly primitive: _angular_core.InputSignal<CheckboxPrimitive>;
    readonly value: _angular_core.InputSignal<boolean | undefined>;
    readonly errors: _angular_core.InputSignal<readonly string[]>;
    readonly valueChange: _angular_core.OutputEmitterRef<boolean>;
    readonly effective: _angular_core.Signal<boolean>;
    static ɵfac: _angular_core.ɵɵFactoryDeclaration<CheckboxFieldComponent, never>;
    static ɵcmp: _angular_core.ɵɵComponentDeclaration<CheckboxFieldComponent, "ds-checkbox-field", never, { "label": { "alias": "label"; "required": true; "isSignal": true; }; "primitive": { "alias": "primitive"; "required": true; "isSignal": true; }; "value": { "alias": "value"; "required": false; "isSignal": true; }; "errors": { "alias": "errors"; "required": false; "isSignal": true; }; }, { "valueChange": "valueChange"; }, never, never, true, never>;
}

declare class EnumFieldComponent {
    readonly label: _angular_core.InputSignal<string>;
    readonly primitive: _angular_core.InputSignal<EnumPrimitive<readonly string[]>>;
    readonly value: _angular_core.InputSignal<string | undefined>;
    readonly errors: _angular_core.InputSignal<readonly string[]>;
    readonly valueChange: _angular_core.OutputEmitterRef<string>;
    readonly effective: _angular_core.Signal<string | null>;
    /** Options paired with a display label — blank values get a visible placeholder so the control isn't empty. */
    readonly optionViews: _angular_core.Signal<{
        value: string;
        label: string;
    }[]>;
    readonly hint: _angular_core.Signal<string | undefined>;
    readonly useSegmented: _angular_core.Signal<boolean>;
    static ɵfac: _angular_core.ɵɵFactoryDeclaration<EnumFieldComponent, never>;
    static ɵcmp: _angular_core.ɵɵComponentDeclaration<EnumFieldComponent, "ds-enum-field", never, { "label": { "alias": "label"; "required": true; "isSignal": true; }; "primitive": { "alias": "primitive"; "required": true; "isSignal": true; }; "value": { "alias": "value"; "required": false; "isSignal": true; }; "errors": { "alias": "errors"; "required": false; "isSignal": true; }; }, { "valueChange": "valueChange"; }, never, never, true, never>;
}

declare class SelectFieldComponent {
    readonly label: _angular_core.InputSignal<string>;
    readonly primitive: _angular_core.InputSignal<SelectPrimitive<string>>;
    readonly value: _angular_core.InputSignal<string | string[] | undefined>;
    readonly errors: _angular_core.InputSignal<readonly string[]>;
    readonly valueChange: _angular_core.OutputEmitterRef<string | string[]>;
    readonly multiple: _angular_core.Signal<boolean>;
    readonly values: _angular_core.Signal<readonly string[]>;
    readonly singleValue: _angular_core.Signal<string>;
    defaultText(): string;
    onSingleInput(event: Event): void;
    addToken(event: MatChipInputEvent): void;
    removeAt(index: number): void;
    static ɵfac: _angular_core.ɵɵFactoryDeclaration<SelectFieldComponent, never>;
    static ɵcmp: _angular_core.ɵɵComponentDeclaration<SelectFieldComponent, "ds-select-field", never, { "label": { "alias": "label"; "required": true; "isSignal": true; }; "primitive": { "alias": "primitive"; "required": true; "isSignal": true; }; "value": { "alias": "value"; "required": false; "isSignal": true; }; "errors": { "alias": "errors"; "required": false; "isSignal": true; }; }, { "valueChange": "valueChange"; }, never, never, true, never>;
}

interface SegmentedOption<Value extends string = string> {
    value: Value;
    title: string;
    icon?: string;
}

declare class ThemeToggleComponent {
    readonly theme: StudioTheme;
    readonly options: readonly SegmentedOption<ThemePreference>[];
    static ɵfac: _angular_core.ɵɵFactoryDeclaration<ThemeToggleComponent, never>;
    static ɵcmp: _angular_core.ɵɵComponentDeclaration<ThemeToggleComponent, "ds-theme-toggle", never, {}, {}, never, never, true, never>;
}

type StudioView = 'canvas' | 'ast' | 'preview' | 'adapter';
interface AdapterResult {
    key: string;
    label: string;
    output: unknown;
    error: string | null;
}
declare class StudioViews {
    #private;
    readonly adapters: _angular_core.WritableSignal<Readonly<Record<string, StudioAdapter<unknown>>>>;
    readonly hasPreview: _angular_core.WritableSignal<boolean>;
    readonly available: _angular_core.Signal<readonly StudioView[]>;
    readonly current: _angular_core.Signal<StudioView>;
    readonly results: _angular_core.Signal<AdapterResult[]>;
    readonly outputs: _angular_core.Signal<Record<string, unknown>>;
    set(view: StudioView): void;
    static ɵfac: _angular_core.ɵɵFactoryDeclaration<StudioViews, never>;
    static ɵprov: _angular_core.ɵɵInjectableDeclaration<StudioViews>;
}

declare class ViewSwitcherComponent {
    readonly views: StudioViews;
    readonly options: _angular_core.Signal<SegmentedOption<StudioView>[]>;
    static ɵfac: _angular_core.ɵɵFactoryDeclaration<ViewSwitcherComponent, never>;
    static ɵcmp: _angular_core.ɵɵComponentDeclaration<ViewSwitcherComponent, "ds-view-switcher", never, {}, {}, never, never, true, never>;
}

export { CanvasComponent, CanvasNodeComponent, CanvasPaletteComponent, CheckboxFieldComponent, DecimalFieldComponent, DsSortableDirective, EnumFieldComponent, FieldHostComponent, InspectorComponent, MetaFieldsComponent, NgxStudioComponent, PropsFormComponent, SelectFieldComponent, StudioHeaderComponent, StudioPreviewDirective, StudioTheme, StudioViews, TextFieldComponent, ThemeToggleComponent, ViewSwitcherComponent };
export type { AdapterResult, DsSortableDropEvent, InspectorFieldChange, InspectorMetaChange, ResolvedTheme, StudioPreviewContext, StudioView, ThemePreference };
