import * as i0 from '@angular/core';
import { inject, TemplateRef, Directive, model, ChangeDetectionStrategy, Component, input, output, signal, computed, contentChild, Injectable, ElementRef, NgZone, booleanAttribute, ApplicationRef, DestroyRef, effect, viewChild, afterNextRender, LOCALE_ID, forwardRef, HostListener } from '@angular/core';
import { isContainer, buildLinkIndex, acceptsChild, Studio, RELATION_OPERATORS, materializeShape, setIn, walk } from '@dynamic-ui/studio';
import { NgTemplateOutlet, DOCUMENT, FormatWidth, getLocaleDateFormat } from '@angular/common';
import { toSignal, takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { BehaviorSubject, switchMap, EMPTY } from 'rxjs';
import Sortable from 'sortablejs';
import { OverlayContainer } from '@angular/cdk/overlay';
import * as i1$5 from '@angular/material/divider';
import { MatDividerModule } from '@angular/material/divider';
import * as i3 from '@angular/material/icon';
import { MatIconModule } from '@angular/material/icon';
import * as i1$2 from '@angular/material/button';
import { MatButtonModule, MatIconButton } from '@angular/material/button';
import * as i1 from '@angular/material/form-field';
import { MatFormFieldModule, MatFormFieldControl } from '@angular/material/form-field';
import * as i2 from '@angular/material/input';
import { MatInputModule } from '@angular/material/input';
import { listify } from 'radash';
import { MAT_DATE_LOCALE, MAT_DATE_FORMATS, ErrorStateMatcher } from '@angular/material/core';
import * as i1$1 from '@angular/material/checkbox';
import { MatCheckboxModule } from '@angular/material/checkbox';
import * as i3$1 from '@angular/material/tooltip';
import { MatTooltipModule } from '@angular/material/tooltip';
import { closeBrackets, closeBracketsKeymap } from '@codemirror/autocomplete';
import { history, defaultKeymap, historyKeymap } from '@codemirror/commands';
import { json, jsonParseLinter } from '@codemirror/lang-json';
import { HighlightStyle, indentOnInput, bracketMatching, syntaxHighlighting, foldGutter, foldKeymap } from '@codemirror/language';
import { linter } from '@codemirror/lint';
import { EditorState } from '@codemirror/state';
import { EditorView, lineNumbers, drawSelection, highlightActiveLine, placeholder, keymap } from '@codemirror/view';
import { tags } from '@lezer/highlight';
import * as i1$3 from '@angular/forms';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import * as i4 from '@angular/material/datepicker';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { provideDateFnsAdapter } from '@angular/material-date-fns-adapter';
import { enUS } from 'date-fns/locale';
import { parseISO, isValid, format, parse } from 'date-fns';
import * as i1$4 from '@angular/material/button-toggle';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import * as i3$2 from '@angular/material/select';
import { MatSelectModule } from '@angular/material/select';
import * as i3$3 from '@angular/material/chips';
import { MatChipsModule } from '@angular/material/chips';
import * as i4$1 from '@angular/material/timepicker';
import { MatTimepickerModule } from '@angular/material/timepicker';

class FolderItemDirective {
    template = inject(TemplateRef);
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "20.3.33", ngImport: i0, type: FolderItemDirective, deps: [], target: i0.ɵɵFactoryTarget.Directive });
    static ɵdir = i0.ɵɵngDeclareDirective({ minVersion: "14.0.0", version: "20.3.33", type: FolderItemDirective, isStandalone: true, selector: "ng-template[dsFolderItem]", ngImport: i0 });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "20.3.33", ngImport: i0, type: FolderItemDirective, decorators: [{
            type: Directive,
            args: [{
                    selector: 'ng-template[dsFolderItem]',
                    standalone: true
                }]
        }] });

function filterFolders(folders, query) {
    const q = query.trim().toLowerCase();
    if (!q)
        return folders;
    return folders.flatMap(folder => {
        if (folder.name.toLowerCase().includes(q))
            return [folder];
        const children = filterFolders(folder.children ?? [], q);
        const items = (folder.items ?? []).filter(i => i.name.toLowerCase().includes(q));
        return children.length || items.length ? [{ ...folder, children, items }] : [];
    });
}

class FoldersSearchComponent {
    value = model('', ...(ngDevMode ? [{ debugName: "value" }] : []));
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "20.3.33", ngImport: i0, type: FoldersSearchComponent, deps: [], target: i0.ɵɵFactoryTarget.Component });
    static ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "17.1.0", version: "20.3.33", type: FoldersSearchComponent, isStandalone: true, selector: "ds-folders-search", inputs: { value: { classPropertyName: "value", publicName: "value", isSignal: true, isRequired: false, transformFunction: null } }, outputs: { value: "valueChange" }, ngImport: i0, template: `
    <label class="search">
      <span class="search__icon material-icons" aria-hidden="true">search</span>
      <input
        class="search__input"
        type="search"
        placeholder="Search"
        [value]="value()"
        (input)="value.set($any($event.target).value)"
      />
    </label>
  `, isInline: true, styles: [":host{display:block}.search{display:flex;align-items:center;gap:8px;padding:0 10px;height:36px;background:var(--ds-input-bg, #f6f7f8);border:1px solid var(--ds-border, #d8dce0);border-radius:8px;cursor:text}.search:focus-within{outline:2px solid var(--ds-accent, #2f6fed);outline-offset:1px;background:var(--ds-sidebar-bg, #fff)}.search__icon{flex:0 0 auto;font-size:16px;color:var(--ds-text-muted, #7a828a)}.search__input{flex:1;min-width:0;border:0;background:transparent;font:inherit;font-size:13px;color:var(--ds-text, #1f2328);outline:none;appearance:none}.search__input::placeholder{color:var(--ds-text-muted, #7a828a)}.search__input::-webkit-search-cancel-button{display:none}\n"], changeDetection: i0.ChangeDetectionStrategy.OnPush });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "20.3.33", ngImport: i0, type: FoldersSearchComponent, decorators: [{
            type: Component,
            args: [{ selector: 'ds-folders-search', standalone: true, changeDetection: ChangeDetectionStrategy.OnPush, template: `
    <label class="search">
      <span class="search__icon material-icons" aria-hidden="true">search</span>
      <input
        class="search__input"
        type="search"
        placeholder="Search"
        [value]="value()"
        (input)="value.set($any($event.target).value)"
      />
    </label>
  `, styles: [":host{display:block}.search{display:flex;align-items:center;gap:8px;padding:0 10px;height:36px;background:var(--ds-input-bg, #f6f7f8);border:1px solid var(--ds-border, #d8dce0);border-radius:8px;cursor:text}.search:focus-within{outline:2px solid var(--ds-accent, #2f6fed);outline-offset:1px;background:var(--ds-sidebar-bg, #fff)}.search__icon{flex:0 0 auto;font-size:16px;color:var(--ds-text-muted, #7a828a)}.search__input{flex:1;min-width:0;border:0;background:transparent;font:inherit;font-size:13px;color:var(--ds-text, #1f2328);outline:none;appearance:none}.search__input::placeholder{color:var(--ds-text-muted, #7a828a)}.search__input::-webkit-search-cancel-button{display:none}\n"] }]
        }], propDecorators: { value: [{ type: i0.Input, args: [{ isSignal: true, alias: "value", required: false }] }, { type: i0.Output, args: ["valueChange"] }] } });

class FoldersNodeComponent {
    folder = input.required(...(ngDevMode ? [{ debugName: "folder" }] : []));
    level = input(0, ...(ngDevMode ? [{ debugName: "level" }] : []));
    selectedId = input(null, ...(ngDevMode ? [{ debugName: "selectedId" }] : []));
    forceExpanded = input(false, ...(ngDevMode ? [{ debugName: "forceExpanded" }] : []));
    itemTemplate = input(null, ...(ngDevMode ? [{ debugName: "itemTemplate" }] : []));
    selected = output();
    #isOpen = signal(false, ...(ngDevMode ? [{ debugName: "#isOpen" }] : []));
    hasContent = computed(() => !!this.folder().children?.length || !!this.folder().items?.length, ...(ngDevMode ? [{ debugName: "hasContent" }] : []));
    expanded = computed(() => this.forceExpanded() || this.#isOpen(), ...(ngDevMode ? [{ debugName: "expanded" }] : []));
    toggle() {
        this.#isOpen.update(open => !open);
    }
    select() {
        this.selected.emit(this.folder());
        if (this.hasContent())
            this.toggle();
    }
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "20.3.33", ngImport: i0, type: FoldersNodeComponent, deps: [], target: i0.ɵɵFactoryTarget.Component });
    static ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "17.0.0", version: "20.3.33", type: FoldersNodeComponent, isStandalone: true, selector: "ds-folders-node", inputs: { folder: { classPropertyName: "folder", publicName: "folder", isSignal: true, isRequired: true, transformFunction: null }, level: { classPropertyName: "level", publicName: "level", isSignal: true, isRequired: false, transformFunction: null }, selectedId: { classPropertyName: "selectedId", publicName: "selectedId", isSignal: true, isRequired: false, transformFunction: null }, forceExpanded: { classPropertyName: "forceExpanded", publicName: "forceExpanded", isSignal: true, isRequired: false, transformFunction: null }, itemTemplate: { classPropertyName: "itemTemplate", publicName: "itemTemplate", isSignal: true, isRequired: false, transformFunction: null } }, outputs: { selected: "selected" }, ngImport: i0, template: `
    <div class="row" [class.row--active]="selectedId() === folder().id" [style.--level]="level()">
      @if (hasContent()) {
        <button
          type="button"
          class="toggle"
          [class.toggle--open]="expanded()"
          [attr.aria-expanded]="expanded()"
          (click)="toggle()"
        >
          <span class="material-icons" aria-hidden="true">chevron_right</span>
        </button>
      } @else {
        <span class="toggle-spacer"></span>
      }

      <button type="button" class="label" (click)="select()">
        <span class="icon material-icons" aria-hidden="true">folder</span>
        <span class="name">{{ folder().name }}</span>
      </button>
    </div>

    @if (hasContent() && expanded()) {
      <ul class="children">
        @for (child of folder().children; track child.id) {
          <li>
            <ds-folders-node
              [folder]="child"
              [level]="level() + 1"
              [selectedId]="selectedId()"
              [forceExpanded]="forceExpanded()"
              [itemTemplate]="itemTemplate()"
              (selected)="selected.emit($event)"
            />
          </li>
        }
        @for (item of folder().items; track item.id) {
          <li class="item" [style.--level]="level() + 1">
            <ng-container
              [ngTemplateOutlet]="itemTemplate() ?? defaultItem"
              [ngTemplateOutletContext]="{ $implicit: item, folder: folder() }"
            />
          </li>
        }
      </ul>
    }

    <ng-template #defaultItem let-item>
      <span class="item__default">
        <span class="icon material-icons" aria-hidden="true">description</span>
        <span class="name">{{ item.name }}</span>
      </span>
    </ng-template>
  `, isInline: true, styles: [":host{display:block}.row{display:flex;align-items:center;min-height:32px;padding-left:calc(var(--level, 0) * 8px);border-radius:6px}.row:hover{background:var(--ds-hover, #eef0f2)}.row--active,.row--active:hover{background:var(--ds-active, #dfe9fd)}.toggle,.toggle-spacer{flex:none;width:24px;height:24px}.toggle{display:grid;place-items:center;padding:0;color:var(--ds-text-muted, #7a828a);background:none;border:0;border-radius:4px;cursor:pointer}.toggle .material-icons{font-size:18px;transition:transform .15s ease}.toggle--open .material-icons{transform:rotate(90deg)}.toggle:focus-visible{outline:2px solid var(--ds-accent, #2f6fed)}.label{flex:1;min-width:0;display:flex;align-items:center;gap:8px;padding:4px 8px 4px 0;font:inherit;color:var(--ds-text, #1f2328);text-align:left;background:none;border:0;cursor:pointer}.label:focus-visible{outline:2px solid var(--ds-accent, #2f6fed);border-radius:4px}.icon{flex:none;font-size:16px;line-height:1;color:var(--ds-folder, #8a929b)}.name{overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.children{margin:0;padding:0;list-style:none}.item{display:flex;align-items:center;padding:0 0 0 calc(var(--level, 0) * 8px + 4px)}.item__default{flex:1;min-width:0;display:flex;align-items:center;gap:8px;color:var(--ds-text, #1f2328)}@media(prefers-reduced-motion:reduce){.toggle .material-icons{transition:none}}\n"], dependencies: [{ kind: "component", type: FoldersNodeComponent, selector: "ds-folders-node", inputs: ["folder", "level", "selectedId", "forceExpanded", "itemTemplate"], outputs: ["selected"] }, { kind: "directive", type: NgTemplateOutlet, selector: "[ngTemplateOutlet]", inputs: ["ngTemplateOutletContext", "ngTemplateOutlet", "ngTemplateOutletInjector"] }], changeDetection: i0.ChangeDetectionStrategy.OnPush });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "20.3.33", ngImport: i0, type: FoldersNodeComponent, decorators: [{
            type: Component,
            args: [{ selector: 'ds-folders-node', standalone: true, changeDetection: ChangeDetectionStrategy.OnPush, imports: [NgTemplateOutlet], template: `
    <div class="row" [class.row--active]="selectedId() === folder().id" [style.--level]="level()">
      @if (hasContent()) {
        <button
          type="button"
          class="toggle"
          [class.toggle--open]="expanded()"
          [attr.aria-expanded]="expanded()"
          (click)="toggle()"
        >
          <span class="material-icons" aria-hidden="true">chevron_right</span>
        </button>
      } @else {
        <span class="toggle-spacer"></span>
      }

      <button type="button" class="label" (click)="select()">
        <span class="icon material-icons" aria-hidden="true">folder</span>
        <span class="name">{{ folder().name }}</span>
      </button>
    </div>

    @if (hasContent() && expanded()) {
      <ul class="children">
        @for (child of folder().children; track child.id) {
          <li>
            <ds-folders-node
              [folder]="child"
              [level]="level() + 1"
              [selectedId]="selectedId()"
              [forceExpanded]="forceExpanded()"
              [itemTemplate]="itemTemplate()"
              (selected)="selected.emit($event)"
            />
          </li>
        }
        @for (item of folder().items; track item.id) {
          <li class="item" [style.--level]="level() + 1">
            <ng-container
              [ngTemplateOutlet]="itemTemplate() ?? defaultItem"
              [ngTemplateOutletContext]="{ $implicit: item, folder: folder() }"
            />
          </li>
        }
      </ul>
    }

    <ng-template #defaultItem let-item>
      <span class="item__default">
        <span class="icon material-icons" aria-hidden="true">description</span>
        <span class="name">{{ item.name }}</span>
      </span>
    </ng-template>
  `, styles: [":host{display:block}.row{display:flex;align-items:center;min-height:32px;padding-left:calc(var(--level, 0) * 8px);border-radius:6px}.row:hover{background:var(--ds-hover, #eef0f2)}.row--active,.row--active:hover{background:var(--ds-active, #dfe9fd)}.toggle,.toggle-spacer{flex:none;width:24px;height:24px}.toggle{display:grid;place-items:center;padding:0;color:var(--ds-text-muted, #7a828a);background:none;border:0;border-radius:4px;cursor:pointer}.toggle .material-icons{font-size:18px;transition:transform .15s ease}.toggle--open .material-icons{transform:rotate(90deg)}.toggle:focus-visible{outline:2px solid var(--ds-accent, #2f6fed)}.label{flex:1;min-width:0;display:flex;align-items:center;gap:8px;padding:4px 8px 4px 0;font:inherit;color:var(--ds-text, #1f2328);text-align:left;background:none;border:0;cursor:pointer}.label:focus-visible{outline:2px solid var(--ds-accent, #2f6fed);border-radius:4px}.icon{flex:none;font-size:16px;line-height:1;color:var(--ds-folder, #8a929b)}.name{overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.children{margin:0;padding:0;list-style:none}.item{display:flex;align-items:center;padding:0 0 0 calc(var(--level, 0) * 8px + 4px)}.item__default{flex:1;min-width:0;display:flex;align-items:center;gap:8px;color:var(--ds-text, #1f2328)}@media(prefers-reduced-motion:reduce){.toggle .material-icons{transition:none}}\n"] }]
        }], propDecorators: { folder: [{ type: i0.Input, args: [{ isSignal: true, alias: "folder", required: true }] }], level: [{ type: i0.Input, args: [{ isSignal: true, alias: "level", required: false }] }], selectedId: [{ type: i0.Input, args: [{ isSignal: true, alias: "selectedId", required: false }] }], forceExpanded: [{ type: i0.Input, args: [{ isSignal: true, alias: "forceExpanded", required: false }] }], itemTemplate: [{ type: i0.Input, args: [{ isSignal: true, alias: "itemTemplate", required: false }] }], selected: [{ type: i0.Output, args: ["selected"] }] } });

class FoldersSidebarComponent {
    folders = input([], ...(ngDevMode ? [{ debugName: "folders" }] : []));
    folderSelected = output();
    itemTpl = contentChild(FolderItemDirective, ...(ngDevMode ? [{ debugName: "itemTpl" }] : []));
    query = signal('', ...(ngDevMode ? [{ debugName: "query" }] : []));
    selectedId = signal(null, ...(ngDevMode ? [{ debugName: "selectedId" }] : []));
    isSearching = computed(() => this.query().trim().length > 0, ...(ngDevMode ? [{ debugName: "isSearching" }] : []));
    filteredFolders = computed(() => filterFolders(this.folders(), this.query()), ...(ngDevMode ? [{ debugName: "filteredFolders" }] : []));
    onSelect(folder) {
        this.selectedId.set(folder.id);
        this.folderSelected.emit(folder);
    }
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "20.3.33", ngImport: i0, type: FoldersSidebarComponent, deps: [], target: i0.ɵɵFactoryTarget.Component });
    static ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "17.0.0", version: "20.3.33", type: FoldersSidebarComponent, isStandalone: true, selector: "ds-folders-sidebar", inputs: { folders: { classPropertyName: "folders", publicName: "folders", isSignal: true, isRequired: false, transformFunction: null } }, outputs: { folderSelected: "folderSelected" }, queries: [{ propertyName: "itemTpl", first: true, predicate: FolderItemDirective, descendants: true, isSignal: true }], ngImport: i0, template: `
    <aside class="sidebar">
      <ds-folders-search [(value)]="query" />

      <div class="sidebar__tree">
        @if (filteredFolders().length) {
          <ul class="tree">
            @for (folder of filteredFolders(); track folder.id) {
              <li>
                <ds-folders-node
                  [folder]="folder"
                  [selectedId]="selectedId()"
                  [forceExpanded]="isSearching()"
                  [itemTemplate]="itemTpl()?.template ?? null"
                  (selected)="onSelect($event)"
                />
              </li>
            }
          </ul>
        } @else {
          <p class="empty">{{ isSearching() ? 'Nothing found' : 'No folders yet' }}</p>
        }
      </div>
    </aside>
  `, isInline: true, styles: [":host{display:block;height:100%}.sidebar{display:flex;flex-direction:column;gap:12px;height:100%;box-sizing:border-box;padding:12px;background:var(--ds-sidebar-bg, #fff);border-right:1px solid var(--ds-border, #d8dce0)}.sidebar__tree{flex:1;min-height:0;overflow-y:auto}.tree{margin:0;padding:0;list-style:none}.empty{margin:0;padding:16px 8px;color:var(--ds-text-muted, #7a828a);text-align:center}\n"], dependencies: [{ kind: "component", type: FoldersSearchComponent, selector: "ds-folders-search", inputs: ["value"], outputs: ["valueChange"] }, { kind: "component", type: FoldersNodeComponent, selector: "ds-folders-node", inputs: ["folder", "level", "selectedId", "forceExpanded", "itemTemplate"], outputs: ["selected"] }], changeDetection: i0.ChangeDetectionStrategy.OnPush });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "20.3.33", ngImport: i0, type: FoldersSidebarComponent, decorators: [{
            type: Component,
            args: [{ selector: 'ds-folders-sidebar', standalone: true, changeDetection: ChangeDetectionStrategy.OnPush, imports: [FoldersSearchComponent, FoldersNodeComponent], template: `
    <aside class="sidebar">
      <ds-folders-search [(value)]="query" />

      <div class="sidebar__tree">
        @if (filteredFolders().length) {
          <ul class="tree">
            @for (folder of filteredFolders(); track folder.id) {
              <li>
                <ds-folders-node
                  [folder]="folder"
                  [selectedId]="selectedId()"
                  [forceExpanded]="isSearching()"
                  [itemTemplate]="itemTpl()?.template ?? null"
                  (selected)="onSelect($event)"
                />
              </li>
            }
          </ul>
        } @else {
          <p class="empty">{{ isSearching() ? 'Nothing found' : 'No folders yet' }}</p>
        }
      </div>
    </aside>
  `, styles: [":host{display:block;height:100%}.sidebar{display:flex;flex-direction:column;gap:12px;height:100%;box-sizing:border-box;padding:12px;background:var(--ds-sidebar-bg, #fff);border-right:1px solid var(--ds-border, #d8dce0)}.sidebar__tree{flex:1;min-height:0;overflow-y:auto}.tree{margin:0;padding:0;list-style:none}.empty{margin:0;padding:16px 8px;color:var(--ds-text-muted, #7a828a);text-align:center}\n"] }]
        }], propDecorators: { folders: [{ type: i0.Input, args: [{ isSignal: true, alias: "folders", required: false }] }], folderSelected: [{ type: i0.Output, args: ["folderSelected"] }], itemTpl: [{ type: i0.ContentChild, args: [i0.forwardRef(() => FolderItemDirective), { isSignal: true }] }] } });

const defaultIcon = (def) => (isContainer(def) ? 'dashboard' : 'tune');
const iconOrDefault = (icon, def) => icon || defaultIcon(def);

const NO_NODES = new Set();
const NO_LINKS = { to: [], from: [] };
const NO_ERRORS = [];
class StudioFacade {
    #source = new BehaviorSubject(null);
    #state = toSignal(this.#source.pipe(switchMap((studio) => (studio ? studio.state$ : EMPTY))), { initialValue: null });
    #inspectorOpen = signal(false, ...(ngDevMode ? [{ debugName: "#inspectorOpen" }] : []));
    #pick = signal(null, ...(ngDevMode ? [{ debugName: "#pick" }] : []));
    #highlighted = signal(NO_NODES, ...(ngDevMode ? [{ debugName: "#highlighted" }] : []));
    root = computed(() => this.#state()?.root ?? null, ...(ngDevMode ? [{ debugName: "root" }] : []));
    selectedId = computed(() => this.#state()?.selectedId ?? null, ...(ngDevMode ? [{ debugName: "selectedId" }] : []));
    links = computed(() => {
        const root = this.root();
        return root ? buildLinkIndex(root) : new Map();
    }, ...(ngDevMode ? [{ debugName: "links" }] : []));
    fieldErrors = computed(() => this.root() ? this.#studio().validate() : new Map(), ...(ngDevMode ? [{ debugName: "fieldErrors" }] : []));
    errorCount = computed(() => [...this.fieldErrors().values()].reduce((total, errors) => total + errors.length, 0), ...(ngDevMode ? [{ debugName: "errorCount" }] : []));
    nodesWithErrors = computed(() => [...this.fieldErrors().keys()], ...(ngDevMode ? [{ debugName: "nodesWithErrors" }] : []));
    picking = computed(() => this.#pick() !== null, ...(ngDevMode ? [{ debugName: "picking" }] : []));
    inspectedId = computed(() => (this.#inspectorOpen() ? this.selectedId() : null), ...(ngDevMode ? [{ debugName: "inspectedId" }] : []));
    inspectedNode = computed(() => {
        this.#state();
        const id = this.inspectedId();
        return id ? (this.#studio().findNode(id) ?? null) : null;
    }, ...(ngDevMode ? [{ debugName: "inspectedNode" }] : []));
    treeSortOptions = {
        group: 'ds-canvas',
        draggable: '.ds-sortable-item',
        handle: '.ds-sortable-handle',
        onMove: evt => {
            const to = evt.to.dataset['dsContainerId'];
            if (!to)
                return true;
            const nodeId = evt.dragged.dataset['dsNodeId'];
            if (nodeId && this.#studio().isDescendant(nodeId, to))
                return false;
            const title = this.#draggedTitle(evt.dragged);
            return title === null || this.#accepts(to, title);
        }
    };
    bind(studio) {
        this.#source.next(studio);
        this.#inspectorOpen.set(false);
    }
    nodeSignal(id) {
        return computed(() => {
            this.#state();
            return this.#studio().findNode(id());
        });
    }
    component(name) {
        return this.#studio().getComponent(name);
    }
    iconOf(node) {
        return iconOrDefault(this.#studio().iconOf(node), this.component(node.name));
    }
    addNode(parentId, input, index) {
        return this.#studio().addNode(parentId, input, index);
    }
    moveNode(id, newParentId, index) {
        this.#studio().moveNode(id, newParentId, index);
    }
    removeNode(id) {
        this.#studio().removeNode(id);
    }
    setProp(id, path, value) {
        this.#studio().setProp(id, path, value);
    }
    setMeta(id, patch) {
        this.#studio().setMeta(id, patch);
    }
    select(id) {
        this.#studio().select(id);
    }
    inspect(id) {
        this.#studio().select(id);
        this.#inspectorOpen.set(true);
    }
    closeInspector() {
        this.#inspectorOpen.set(false);
    }
    setRelation(id, name, value) {
        this.#studio().setRelation(id, name, value);
    }
    removeRelation(id, name) {
        this.#studio().removeRelation(id, name);
    }
    relationTargets(nodeId, filter) {
        return this.#studio().relationTargets(nodeId, filter);
    }
    runAdapter(adapter) {
        return this.#studio().runAdapter(adapter);
    }
    nodeLabel(id) {
        const node = this.#studio().findNode(id);
        if (!node)
            return id;
        return node.fieldName ?? node.title ?? this.component(node.name)?.label ?? node.name;
    }
    linksOf(id) {
        return this.links().get(id) ?? NO_LINKS;
    }
    errorsOf(id) {
        return this.fieldErrors().get(id) ?? NO_ERRORS;
    }
    describeNode(id) {
        const node = this.#studio().findNode(id);
        if (!node)
            return { name: id, type: null };
        const type = this.component(node.name)?.label ?? node.name;
        const name = node.fieldName ?? node.title;
        return name ? { name, type } : { name: type, type: null };
    }
    highlight(ids) {
        this.#highlighted.set(new Set(ids));
    }
    clearHighlight() {
        if (this.#highlighted().size)
            this.#highlighted.set(NO_NODES);
    }
    isHighlighted(id) {
        return this.#highlighted().has(id);
    }
    pickable(id) {
        return this.#pick()?.eligible.has(id) ?? false;
    }
    startPick(eligible, resolve) {
        this.clearHighlight();
        this.#pick.set({ eligible: new Set(eligible), resolve });
    }
    resolvePick(id) {
        const pick = this.#pick();
        if (!pick?.eligible.has(id))
            return;
        this.#pick.set(null);
        pick.resolve(id);
    }
    cancelPick() {
        this.#pick.set(null);
    }
    applyDrop(evt) {
        const targetId = evt.to.dataset['dsContainerId'];
        if (!targetId)
            return false;
        const paletteName = evt.item.dataset['dsPaletteName'];
        if (paletteName) {
            if (!this.#accepts(targetId, paletteName))
                return false;
            this.addNode(targetId, { name: paletteName }, evt.newIndex);
            return true;
        }
        const nodeId = evt.item.dataset['dsNodeId'];
        if (!nodeId)
            return false;
        if (this.#studio().isDescendant(nodeId, targetId))
            return false;
        const title = this.#studio().findNode(nodeId)?.name;
        if (title && !this.#accepts(targetId, title))
            return false;
        this.moveNode(nodeId, targetId, evt.newIndex);
        return true;
    }
    /** The component title of a dragged element — a palette chip or an existing node. */
    #draggedTitle(el) {
        const paletteName = el.dataset['dsPaletteName'];
        if (paletteName)
            return paletteName;
        const nodeId = el.dataset['dsNodeId'];
        return nodeId ? (this.#studio().findNode(nodeId)?.name ?? null) : null;
    }
    /** Whether the container node accepts a child of the given component title. */
    #accepts(containerId, childTitle) {
        const node = this.#studio().findNode(containerId);
        const def = node && this.component(node.name);
        return def ? acceptsChild(def, childTitle) : true;
    }
    #studio() {
        const studio = this.#source.value;
        if (!studio)
            throw new Error('StudioFacade: studio is not bound');
        return studio;
    }
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "20.3.33", ngImport: i0, type: StudioFacade, deps: [], target: i0.ɵɵFactoryTarget.Injectable });
    static ɵprov = i0.ɵɵngDeclareInjectable({ minVersion: "12.0.0", version: "20.3.33", ngImport: i0, type: StudioFacade });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "20.3.33", ngImport: i0, type: StudioFacade, decorators: [{
            type: Injectable
        }] });

class DsSortableDirective {
    options = input({}, ...(ngDevMode ? [{ debugName: "options" }] : []));
    dsSortableDrop = output();
    #el = inject((ElementRef));
    #zone = inject(NgZone);
    #sortable;
    ngAfterViewInit() {
        this.#zone.runOutsideAngular(() => {
            this.#sortable = Sortable.create(this.#el.nativeElement, {
                animation: 200,
                easing: 'cubic-bezier(0.4, 0, 0.2, 1)',
                swapThreshold: 0.65,
                invertSwap: true,
                emptyInsertThreshold: 24,
                delay: 60,
                delayOnTouchOnly: true,
                ghostClass: 'ds-sortable-ghost',
                chosenClass: 'ds-sortable-chosen',
                ...this.options(),
                onStart: () => document.body.classList.add('ds-has-drag'),
                onEnd: evt => this.#handleEnd(evt)
            });
        });
    }
    ngOnDestroy() {
        this.#sortable.destroy();
    }
    #handleEnd(evt) {
        document.body.classList.remove('ds-has-drag');
        if (evt.from === evt.to && evt.oldIndex === evt.newIndex)
            return;
        const isClone = evt.pullMode === 'clone';
        const { item, from } = evt;
        const oldIndex = evt.oldIndex;
        const newIndex = evt.newIndex;
        item.remove();
        if (!isClone)
            insertAtIndex(from, item, oldIndex);
        this.#zone.run(() => {
            this.dsSortableDrop.emit({ from, to: evt.to, oldIndex, newIndex, item, isClone });
        });
    }
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "20.3.33", ngImport: i0, type: DsSortableDirective, deps: [], target: i0.ɵɵFactoryTarget.Directive });
    static ɵdir = i0.ɵɵngDeclareDirective({ minVersion: "17.1.0", version: "20.3.33", type: DsSortableDirective, isStandalone: true, selector: "[dsSortable]", inputs: { options: { classPropertyName: "options", publicName: "options", isSignal: true, isRequired: false, transformFunction: null } }, outputs: { dsSortableDrop: "dsSortableDrop" }, ngImport: i0 });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "20.3.33", ngImport: i0, type: DsSortableDirective, decorators: [{
            type: Directive,
            args: [{
                    selector: '[dsSortable]',
                    standalone: true
                }]
        }], propDecorators: { options: [{ type: i0.Input, args: [{ isSignal: true, alias: "options", required: false }] }], dsSortableDrop: [{ type: i0.Output, args: ["dsSortableDrop"] }] } });
function insertAtIndex(parent, el, index) {
    if (index >= parent.children.length)
        parent.appendChild(el);
    else
        parent.insertBefore(el, parent.children[index]);
}

class CanvasPaletteComponent {
    facade = inject(StudioFacade);
    components = input.required(...(ngDevMode ? [{ debugName: "components" }] : []));
    folders = computed(() => componentsToFolders(this.components()), ...(ngDevMode ? [{ debugName: "folders" }] : []));
    iconOrDefault = iconOrDefault;
    isContainer = isContainer;
    sortOptions = {
        group: { name: 'ds-canvas', pull: 'clone', put: false },
        sort: false,
        draggable: '.ds-sortable-item'
    };
    defOf(item) {
        return this.facade.component(String(item.id));
    }
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "20.3.33", ngImport: i0, type: CanvasPaletteComponent, deps: [], target: i0.ɵɵFactoryTarget.Component });
    static ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "17.0.0", version: "20.3.33", type: CanvasPaletteComponent, isStandalone: true, selector: "ds-canvas-palette", inputs: { components: { classPropertyName: "components", publicName: "components", isSignal: true, isRequired: true, transformFunction: null } }, ngImport: i0, template: `
    <ds-folders-sidebar [folders]="folders()">
      <ng-template dsFolderItem let-item>
        @let def = defOf(item);
        <div class="chip-slot" dsSortable [options]="sortOptions" (dsSortableDrop)="facade.applyDrop($event)">
          <div class="chip ds-sortable-item" [attr.data-ds-palette-name]="def.title">
            <span class="chip__icon">
              <span class="material-icons" aria-hidden="true">{{ iconOrDefault(def.icon, def) }}</span>
            </span>
            <div class="chip__text">
              <span class="chip__title">{{ def.label }}</span>
              @if (def.description) {
                <span class="chip__sub">{{ def.description }}</span>
              }
            </div>
            @if (isContainer(def)) {
              <span class="chip__badge" title="Container">
                <span class="material-icons" aria-hidden="true">account_tree</span>
              </span>
            }
          </div>
        </div>
      </ng-template>
    </ds-folders-sidebar>
  `, isInline: true, styles: [":host{display:block;height:100%;overflow:hidden}.chip-slot{flex:1;min-width:0;padding:2px 0}.chip{display:flex;align-items:center;gap:10px;width:100%;padding:10px 12px;min-height:52px;box-sizing:border-box;background:var(--ds-chip-bg);border:1px solid transparent;border-radius:var(--ds-radius-sm);cursor:grab;-webkit-user-select:none;user-select:none;transition:background .14s ease,border-color .14s ease}.chip:hover{background:var(--ds-chip-bg-hover);border-color:var(--ds-border)}.chip:active{cursor:grabbing}.chip__icon{display:inline-flex;align-items:center;justify-content:center;width:28px;height:28px;color:var(--ds-accent);background:var(--ds-accent-soft);border-radius:6px;flex:0 0 auto}.chip__icon .material-icons{font-size:16px}.chip__text{display:flex;flex-direction:column;min-width:0;flex:1 1 auto}.chip__title,.chip__sub{overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.chip__title{font-size:13px;font-weight:600;line-height:1.2;color:var(--ds-text)}.chip__sub{font-size:11px;margin-top:2px;color:var(--ds-text-muted)}.chip__badge{display:inline-flex;align-items:center;justify-content:center;color:var(--ds-accent);opacity:.85;flex:0 0 auto}.chip__badge .material-icons{font-size:16px}\n"], dependencies: [{ kind: "component", type: FoldersSidebarComponent, selector: "ds-folders-sidebar", inputs: ["folders"], outputs: ["folderSelected"] }, { kind: "directive", type: FolderItemDirective, selector: "ng-template[dsFolderItem]" }, { kind: "directive", type: DsSortableDirective, selector: "[dsSortable]", inputs: ["options"], outputs: ["dsSortableDrop"] }], changeDetection: i0.ChangeDetectionStrategy.OnPush });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "20.3.33", ngImport: i0, type: CanvasPaletteComponent, decorators: [{
            type: Component,
            args: [{ selector: 'ds-canvas-palette', standalone: true, imports: [FoldersSidebarComponent, FolderItemDirective, DsSortableDirective], changeDetection: ChangeDetectionStrategy.OnPush, template: `
    <ds-folders-sidebar [folders]="folders()">
      <ng-template dsFolderItem let-item>
        @let def = defOf(item);
        <div class="chip-slot" dsSortable [options]="sortOptions" (dsSortableDrop)="facade.applyDrop($event)">
          <div class="chip ds-sortable-item" [attr.data-ds-palette-name]="def.title">
            <span class="chip__icon">
              <span class="material-icons" aria-hidden="true">{{ iconOrDefault(def.icon, def) }}</span>
            </span>
            <div class="chip__text">
              <span class="chip__title">{{ def.label }}</span>
              @if (def.description) {
                <span class="chip__sub">{{ def.description }}</span>
              }
            </div>
            @if (isContainer(def)) {
              <span class="chip__badge" title="Container">
                <span class="material-icons" aria-hidden="true">account_tree</span>
              </span>
            }
          </div>
        </div>
      </ng-template>
    </ds-folders-sidebar>
  `, styles: [":host{display:block;height:100%;overflow:hidden}.chip-slot{flex:1;min-width:0;padding:2px 0}.chip{display:flex;align-items:center;gap:10px;width:100%;padding:10px 12px;min-height:52px;box-sizing:border-box;background:var(--ds-chip-bg);border:1px solid transparent;border-radius:var(--ds-radius-sm);cursor:grab;-webkit-user-select:none;user-select:none;transition:background .14s ease,border-color .14s ease}.chip:hover{background:var(--ds-chip-bg-hover);border-color:var(--ds-border)}.chip:active{cursor:grabbing}.chip__icon{display:inline-flex;align-items:center;justify-content:center;width:28px;height:28px;color:var(--ds-accent);background:var(--ds-accent-soft);border-radius:6px;flex:0 0 auto}.chip__icon .material-icons{font-size:16px}.chip__text{display:flex;flex-direction:column;min-width:0;flex:1 1 auto}.chip__title,.chip__sub{overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.chip__title{font-size:13px;font-weight:600;line-height:1.2;color:var(--ds-text)}.chip__sub{font-size:11px;margin-top:2px;color:var(--ds-text-muted)}.chip__badge{display:inline-flex;align-items:center;justify-content:center;color:var(--ds-accent);opacity:.85;flex:0 0 auto}.chip__badge .material-icons{font-size:16px}\n"] }]
        }], propDecorators: { components: [{ type: i0.Input, args: [{ isSignal: true, alias: "components", required: true }] }] } });
function componentsToFolders(components) {
    const root = { children: {}, items: [] };
    for (const c of components) {
        const parts = c.title.split('/');
        const leaf = parts.pop();
        let node = root;
        for (const part of parts) {
            node.children[part] ??= { children: {}, items: [] };
            node = node.children[part];
        }
        node.items.push({ id: c.title, name: leaf });
    }
    const build = (node, prefix) => Object.entries(node.children).map(([seg, child]) => {
        const id = prefix ? `${prefix}/${seg}` : seg;
        return {
            id,
            name: seg,
            children: build(child, id),
            items: child.items
        };
    });
    const folders = build(root, '');
    if (root.items.length)
        folders.unshift({ id: '_root', name: '', items: root.items });
    return folders;
}

/** Joins labels into a readable list: `a`, `a or b`, `a, b or c`. */
function formatList(labels) {
    if (labels.length <= 1)
        return labels.join('');
    return `${labels.slice(0, -1).join(', ')} or ${labels[labels.length - 1]}`;
}
class CanvasNodeComponent {
    facade = inject(StudioFacade);
    nodeId = input.required(...(ngDevMode ? [{ debugName: "nodeId" }] : []));
    node = this.facade.nodeSignal(() => this.nodeId());
    component = computed(() => this.facade.component(this.node().name), ...(ngDevMode ? [{ debugName: "component" }] : []));
    container = computed(() => isContainer(this.component()), ...(ngDevMode ? [{ debugName: "container" }] : []));
    dropHint = computed(() => {
        const rule = this.component().container;
        if (!rule || rule === true)
            return 'Drop a component here';
        const labels = rule.kind.map(title => this.facade.component(title)?.label ?? title);
        return labels.length ? `Drop ${formatList(labels)} here` : 'Drop a component here';
    }, ...(ngDevMode ? [{ debugName: "dropHint" }] : []));
    isSelected = computed(() => this.facade.selectedId() === this.nodeId(), ...(ngDevMode ? [{ debugName: "isSelected" }] : []));
    isInspected = computed(() => this.facade.inspectedId() === this.nodeId(), ...(ngDevMode ? [{ debugName: "isInspected" }] : []));
    pickable = computed(() => this.facade.pickable(this.nodeId()), ...(ngDevMode ? [{ debugName: "pickable" }] : []));
    icon = computed(() => this.facade.iconOf(this.node()), ...(ngDevMode ? [{ debugName: "icon" }] : []));
    errors = computed(() => this.facade.errorsOf(this.nodeId()), ...(ngDevMode ? [{ debugName: "errors" }] : []));
    errorHint = computed(() => this.errors()
        .map(error => `${error.label}: ${error.messages.join(', ')}`)
        .join('\n'), ...(ngDevMode ? [{ debugName: "errorHint" }] : []));
    subtitle = computed(() => this.node().title ?? this.component().description, ...(ngDevMode ? [{ debugName: "subtitle" }] : []));
    linkBadges = computed(() => {
        const { to, from } = this.facade.linksOf(this.nodeId());
        const names = (ids) => ids.map(id => this.facade.nodeLabel(id)).join(', ');
        const badges = [];
        if (to.length)
            badges.push({ direction: 'out', icon: 'call_made', ids: to, hint: `Depends on ${names(to)}` });
        if (from.length)
            badges.push({ direction: 'in', icon: 'call_received', ids: from, hint: `Used by ${names(from)}` });
        return badges;
    }, ...(ngDevMode ? [{ debugName: "linkBadges" }] : []));
    onSelect(event) {
        event.stopPropagation();
        if (this.facade.picking()) {
            this.facade.resolvePick(this.nodeId());
            return;
        }
        this.facade.select(this.nodeId());
    }
    onEdit(event) {
        event.stopPropagation();
        this.facade.inspect(this.nodeId());
    }
    onRemove(event) {
        event.stopPropagation();
        this.facade.removeNode(this.nodeId());
    }
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "20.3.33", ngImport: i0, type: CanvasNodeComponent, deps: [], target: i0.ɵɵFactoryTarget.Component });
    static ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "17.0.0", version: "20.3.33", type: CanvasNodeComponent, isStandalone: true, selector: "ds-canvas-node", inputs: { nodeId: { classPropertyName: "nodeId", publicName: "nodeId", isSignal: true, isRequired: true, transformFunction: null } }, ngImport: i0, template: `
    @let n = node();
    @let def = component();
    <article
      class="card"
      [class.card--selected]="isSelected()"
      [class.card--container]="container()"
      [class.card--pickable]="facade.picking() && pickable()"
      [class.card--dimmed]="facade.picking() && !pickable()"
      [class.card--linked]="facade.isHighlighted(nodeId())"
      (click)="onSelect($event)"
    >
      <header class="card__head ds-sortable-handle">
        <span class="card__grip" aria-hidden="true">
          <span class="material-icons">drag_indicator</span>
        </span>
        <span class="card__icon">
          <span class="material-icons" aria-hidden="true">{{ icon() }}</span>
        </span>
        <div class="card__titles">
          <div class="card__title-row">
            <span class="card__title">{{ def.label }}</span>
            @if (n.fieldName; as fieldName) {
              <code class="card__field-name" [attr.title]="'Field name: ' + fieldName">{{ fieldName }}</code>
            }
          </div>
          @if (subtitle(); as sub) {
            <span class="card__subtitle">{{ sub }}</span>
          }
        </div>
        @if (errors().length) {
          <button type="button" class="card__error" [attr.title]="errorHint()" (click)="onEdit($event)">
            <span class="material-icons" aria-hidden="true">error</span>
            {{ errors().length }}
          </button>
        }
        @for (badge of linkBadges(); track badge.direction) {
          <span
            class="card__link"
            [class.card__link--out]="badge.direction === 'out'"
            [class.card__link--in]="badge.direction === 'in'"
            tabindex="0"
            [attr.title]="badge.hint"
            (mouseenter)="facade.highlight(badge.ids)"
            (mouseleave)="facade.clearHighlight()"
            (focus)="facade.highlight(badge.ids)"
            (blur)="facade.clearHighlight()"
          >
            <span class="material-icons" aria-hidden="true">{{ badge.icon }}</span>
            {{ badge.ids.length }}
          </span>
        }
        <button
          type="button"
          class="card__action card__action--edit"
          [class.card__action--active]="isInspected()"
          (click)="onEdit($event)"
        >
          <span class="material-icons" aria-hidden="true">tune</span>
        </button>
        <button type="button" class="card__action card__action--delete" (click)="onRemove($event)">
          <span class="material-icons" aria-hidden="true">close</span>
        </button>
      </header>

      @if (container()) {
        <section class="card__body">
          <div
            class="dropzone"
            dsSortable
            [options]="facade.treeSortOptions"
            [attr.data-ds-container-id]="n.id"
            (dsSortableDrop)="facade.applyDrop($event)"
          >
            @for (child of n.children; track child.id) {
              <div class="dropzone__item ds-sortable-item" [attr.data-ds-node-id]="child.id">
                <ds-canvas-node [nodeId]="child.id" />
              </div>
            } @empty {
              <div class="dropzone__empty">
                <span class="material-icons dropzone__empty-icon" aria-hidden="true">add</span>
                <span>{{ dropHint() }}</span>
              </div>
            }
          </div>
        </section>
      }
    </article>
  `, isInline: true, styles: [":host{display:block;animation:ds-card-in .18s cubic-bezier(.2,.8,.2,1) both}.card{position:relative;background:var(--ds-card-bg);border:1px solid var(--ds-card-border);border-radius:var(--ds-radius);box-shadow:var(--ds-card-shadow);transition:box-shadow .16s ease,border-color .16s ease,background-color .16s ease,transform .16s ease}.card:hover{box-shadow:var(--ds-card-shadow-hover)}.card--container{background:var(--ds-card-bg-container)}.card--selected{border-color:var(--ds-accent);box-shadow:0 0 0 3px var(--ds-accent-ring),var(--ds-card-shadow-hover)}.card--linked{background-color:color-mix(in srgb,var(--ds-accent) 7%,var(--ds-card-bg));border-color:var(--ds-accent-ring);box-shadow:var(--ds-card-shadow-hover)}.card--pickable{cursor:pointer;border-color:var(--ds-accent);box-shadow:0 0 0 2px var(--ds-accent-ring)}.card--pickable>.card__head{cursor:pointer}.card--pickable:hover{box-shadow:0 0 0 3px var(--ds-accent),var(--ds-card-shadow-hover)}.card--dimmed>.card__head{opacity:.4;filter:grayscale(.3)}.card__head{display:flex;align-items:center;gap:10px;padding:14px;min-height:56px;box-sizing:border-box;cursor:grab;-webkit-user-select:none;user-select:none}.card__head:active{cursor:grabbing}.card__grip{display:inline-flex;align-items:center;justify-content:center;color:var(--ds-text-muted);opacity:.45;transition:opacity .12s ease;flex:0 0 auto;margin-right:-4px}.card__grip .material-icons{font-size:18px}.card:hover:not(:has(.card:hover)) .card__grip{opacity:1}.card__icon{display:inline-flex;align-items:center;justify-content:center;width:30px;height:30px;color:var(--ds-accent);background:var(--ds-accent-soft);border-radius:8px;flex:0 0 auto}.card__icon .material-icons{font-size:18px}.card__titles{display:flex;flex-direction:column;min-width:0;flex:1 1 auto}.card__title-row{display:flex;align-items:center;gap:8px;min-width:0}.card__title,.card__subtitle,.card__field-name{overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.card__title{flex:0 1 auto;font-size:13px;font-weight:600;line-height:1.2;color:var(--ds-text)}.card__field-name{flex:0 100 auto;min-width:0;padding:1px 6px;font:500 11px/16px JetBrains Mono,SF Mono,ui-monospace,Menlo,Consolas,monospace;color:var(--ds-accent);background:var(--ds-accent-soft);border-radius:6px}.card__subtitle{font-size:11px;line-height:1.2;margin-top:2px;color:var(--ds-text-muted)}.card__link{display:inline-flex;align-items:center;gap:3px;height:22px;padding:0 8px 0 6px;font-size:11px;font-weight:600;font-variant-numeric:tabular-nums;color:var(--ds-text-muted);background:var(--ds-chip-bg);border-radius:999px;cursor:default;flex:0 0 auto;transition:color .12s ease,background .12s ease}.card__link .material-icons{font-size:14px}.card__link:hover,.card__link:focus-visible{color:var(--ds-accent);background:var(--ds-accent-soft);outline:none}.card__error{display:inline-flex;align-items:center;gap:3px;height:22px;padding:0 8px 0 6px;font-size:11px;font-weight:600;font-variant-numeric:tabular-nums;color:#ef4444;background:#ef44441a;border:none;border-radius:999px;cursor:pointer;flex:0 0 auto;transition:background .12s ease}.card__error .material-icons{font-size:14px}.card__error:hover,.card__error:focus-visible{background:#ef44442e;outline:none}.card__action{display:inline-flex;align-items:center;justify-content:center;width:26px;height:26px;padding:0;border:none;background:transparent;color:var(--ds-text-muted);border-radius:6px;cursor:pointer;opacity:0;transition:opacity .12s ease,background .12s ease,color .12s ease;flex:0 0 auto}.card__action .material-icons{font-size:16px}.card__action--edit:hover,.card__action--edit--active{color:var(--ds-accent);background:var(--ds-accent-soft)}.card__action--delete:hover{color:#ef4444;background:#ef44441a}.card__action--active{opacity:1}.card:hover:not(:has(.card:hover)) .card__action,.card--selected .card__action{opacity:1}.card__body{padding:0 10px 10px}.dropzone{display:flex;flex-direction:column;gap:10px;min-height:72px;padding:10px;border-radius:var(--ds-radius-sm);background:var(--ds-dropzone-bg);border:1px dashed transparent;transition:background .16s ease,border-color .16s ease,min-height .18s ease}.dropzone__empty{display:flex;align-items:center;justify-content:center;gap:8px;padding:16px;min-height:52px;box-sizing:border-box;font-size:12px;color:var(--ds-text-muted);border:1px dashed var(--ds-border-dashed);border-radius:var(--ds-radius-sm);pointer-events:none}.dropzone__empty-icon{display:inline-flex;align-items:center;justify-content:center;width:20px;height:20px;color:var(--ds-accent);background:var(--ds-accent-soft);border-radius:50%}.dropzone__empty-icon.material-icons{font-size:14px}:host-context(.ds-has-drag) .dropzone:not(:has(.dropzone__item)){min-height:104px;background:var(--ds-dropzone-bg-active);border-color:var(--ds-accent)}:host-context(.ds-has-drag) .dropzone__empty{min-height:76px;border-color:var(--ds-accent);color:var(--ds-accent)}@keyframes ds-card-in{0%{opacity:0;transform:translateY(-4px) scale(.98)}to{opacity:1;transform:translateY(0) scale(1)}}\n"], dependencies: [{ kind: "component", type: CanvasNodeComponent, selector: "ds-canvas-node", inputs: ["nodeId"] }, { kind: "directive", type: DsSortableDirective, selector: "[dsSortable]", inputs: ["options"], outputs: ["dsSortableDrop"] }], changeDetection: i0.ChangeDetectionStrategy.OnPush });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "20.3.33", ngImport: i0, type: CanvasNodeComponent, decorators: [{
            type: Component,
            args: [{ selector: 'ds-canvas-node', standalone: true, imports: [DsSortableDirective], changeDetection: ChangeDetectionStrategy.OnPush, template: `
    @let n = node();
    @let def = component();
    <article
      class="card"
      [class.card--selected]="isSelected()"
      [class.card--container]="container()"
      [class.card--pickable]="facade.picking() && pickable()"
      [class.card--dimmed]="facade.picking() && !pickable()"
      [class.card--linked]="facade.isHighlighted(nodeId())"
      (click)="onSelect($event)"
    >
      <header class="card__head ds-sortable-handle">
        <span class="card__grip" aria-hidden="true">
          <span class="material-icons">drag_indicator</span>
        </span>
        <span class="card__icon">
          <span class="material-icons" aria-hidden="true">{{ icon() }}</span>
        </span>
        <div class="card__titles">
          <div class="card__title-row">
            <span class="card__title">{{ def.label }}</span>
            @if (n.fieldName; as fieldName) {
              <code class="card__field-name" [attr.title]="'Field name: ' + fieldName">{{ fieldName }}</code>
            }
          </div>
          @if (subtitle(); as sub) {
            <span class="card__subtitle">{{ sub }}</span>
          }
        </div>
        @if (errors().length) {
          <button type="button" class="card__error" [attr.title]="errorHint()" (click)="onEdit($event)">
            <span class="material-icons" aria-hidden="true">error</span>
            {{ errors().length }}
          </button>
        }
        @for (badge of linkBadges(); track badge.direction) {
          <span
            class="card__link"
            [class.card__link--out]="badge.direction === 'out'"
            [class.card__link--in]="badge.direction === 'in'"
            tabindex="0"
            [attr.title]="badge.hint"
            (mouseenter)="facade.highlight(badge.ids)"
            (mouseleave)="facade.clearHighlight()"
            (focus)="facade.highlight(badge.ids)"
            (blur)="facade.clearHighlight()"
          >
            <span class="material-icons" aria-hidden="true">{{ badge.icon }}</span>
            {{ badge.ids.length }}
          </span>
        }
        <button
          type="button"
          class="card__action card__action--edit"
          [class.card__action--active]="isInspected()"
          (click)="onEdit($event)"
        >
          <span class="material-icons" aria-hidden="true">tune</span>
        </button>
        <button type="button" class="card__action card__action--delete" (click)="onRemove($event)">
          <span class="material-icons" aria-hidden="true">close</span>
        </button>
      </header>

      @if (container()) {
        <section class="card__body">
          <div
            class="dropzone"
            dsSortable
            [options]="facade.treeSortOptions"
            [attr.data-ds-container-id]="n.id"
            (dsSortableDrop)="facade.applyDrop($event)"
          >
            @for (child of n.children; track child.id) {
              <div class="dropzone__item ds-sortable-item" [attr.data-ds-node-id]="child.id">
                <ds-canvas-node [nodeId]="child.id" />
              </div>
            } @empty {
              <div class="dropzone__empty">
                <span class="material-icons dropzone__empty-icon" aria-hidden="true">add</span>
                <span>{{ dropHint() }}</span>
              </div>
            }
          </div>
        </section>
      }
    </article>
  `, styles: [":host{display:block;animation:ds-card-in .18s cubic-bezier(.2,.8,.2,1) both}.card{position:relative;background:var(--ds-card-bg);border:1px solid var(--ds-card-border);border-radius:var(--ds-radius);box-shadow:var(--ds-card-shadow);transition:box-shadow .16s ease,border-color .16s ease,background-color .16s ease,transform .16s ease}.card:hover{box-shadow:var(--ds-card-shadow-hover)}.card--container{background:var(--ds-card-bg-container)}.card--selected{border-color:var(--ds-accent);box-shadow:0 0 0 3px var(--ds-accent-ring),var(--ds-card-shadow-hover)}.card--linked{background-color:color-mix(in srgb,var(--ds-accent) 7%,var(--ds-card-bg));border-color:var(--ds-accent-ring);box-shadow:var(--ds-card-shadow-hover)}.card--pickable{cursor:pointer;border-color:var(--ds-accent);box-shadow:0 0 0 2px var(--ds-accent-ring)}.card--pickable>.card__head{cursor:pointer}.card--pickable:hover{box-shadow:0 0 0 3px var(--ds-accent),var(--ds-card-shadow-hover)}.card--dimmed>.card__head{opacity:.4;filter:grayscale(.3)}.card__head{display:flex;align-items:center;gap:10px;padding:14px;min-height:56px;box-sizing:border-box;cursor:grab;-webkit-user-select:none;user-select:none}.card__head:active{cursor:grabbing}.card__grip{display:inline-flex;align-items:center;justify-content:center;color:var(--ds-text-muted);opacity:.45;transition:opacity .12s ease;flex:0 0 auto;margin-right:-4px}.card__grip .material-icons{font-size:18px}.card:hover:not(:has(.card:hover)) .card__grip{opacity:1}.card__icon{display:inline-flex;align-items:center;justify-content:center;width:30px;height:30px;color:var(--ds-accent);background:var(--ds-accent-soft);border-radius:8px;flex:0 0 auto}.card__icon .material-icons{font-size:18px}.card__titles{display:flex;flex-direction:column;min-width:0;flex:1 1 auto}.card__title-row{display:flex;align-items:center;gap:8px;min-width:0}.card__title,.card__subtitle,.card__field-name{overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.card__title{flex:0 1 auto;font-size:13px;font-weight:600;line-height:1.2;color:var(--ds-text)}.card__field-name{flex:0 100 auto;min-width:0;padding:1px 6px;font:500 11px/16px JetBrains Mono,SF Mono,ui-monospace,Menlo,Consolas,monospace;color:var(--ds-accent);background:var(--ds-accent-soft);border-radius:6px}.card__subtitle{font-size:11px;line-height:1.2;margin-top:2px;color:var(--ds-text-muted)}.card__link{display:inline-flex;align-items:center;gap:3px;height:22px;padding:0 8px 0 6px;font-size:11px;font-weight:600;font-variant-numeric:tabular-nums;color:var(--ds-text-muted);background:var(--ds-chip-bg);border-radius:999px;cursor:default;flex:0 0 auto;transition:color .12s ease,background .12s ease}.card__link .material-icons{font-size:14px}.card__link:hover,.card__link:focus-visible{color:var(--ds-accent);background:var(--ds-accent-soft);outline:none}.card__error{display:inline-flex;align-items:center;gap:3px;height:22px;padding:0 8px 0 6px;font-size:11px;font-weight:600;font-variant-numeric:tabular-nums;color:#ef4444;background:#ef44441a;border:none;border-radius:999px;cursor:pointer;flex:0 0 auto;transition:background .12s ease}.card__error .material-icons{font-size:14px}.card__error:hover,.card__error:focus-visible{background:#ef44442e;outline:none}.card__action{display:inline-flex;align-items:center;justify-content:center;width:26px;height:26px;padding:0;border:none;background:transparent;color:var(--ds-text-muted);border-radius:6px;cursor:pointer;opacity:0;transition:opacity .12s ease,background .12s ease,color .12s ease;flex:0 0 auto}.card__action .material-icons{font-size:16px}.card__action--edit:hover,.card__action--edit--active{color:var(--ds-accent);background:var(--ds-accent-soft)}.card__action--delete:hover{color:#ef4444;background:#ef44441a}.card__action--active{opacity:1}.card:hover:not(:has(.card:hover)) .card__action,.card--selected .card__action{opacity:1}.card__body{padding:0 10px 10px}.dropzone{display:flex;flex-direction:column;gap:10px;min-height:72px;padding:10px;border-radius:var(--ds-radius-sm);background:var(--ds-dropzone-bg);border:1px dashed transparent;transition:background .16s ease,border-color .16s ease,min-height .18s ease}.dropzone__empty{display:flex;align-items:center;justify-content:center;gap:8px;padding:16px;min-height:52px;box-sizing:border-box;font-size:12px;color:var(--ds-text-muted);border:1px dashed var(--ds-border-dashed);border-radius:var(--ds-radius-sm);pointer-events:none}.dropzone__empty-icon{display:inline-flex;align-items:center;justify-content:center;width:20px;height:20px;color:var(--ds-accent);background:var(--ds-accent-soft);border-radius:50%}.dropzone__empty-icon.material-icons{font-size:14px}:host-context(.ds-has-drag) .dropzone:not(:has(.dropzone__item)){min-height:104px;background:var(--ds-dropzone-bg-active);border-color:var(--ds-accent)}:host-context(.ds-has-drag) .dropzone__empty{min-height:76px;border-color:var(--ds-accent);color:var(--ds-accent)}@keyframes ds-card-in{0%{opacity:0;transform:translateY(-4px) scale(.98)}to{opacity:1;transform:translateY(0) scale(1)}}\n"] }]
        }], propDecorators: { nodeId: [{ type: i0.Input, args: [{ isSignal: true, alias: "nodeId", required: true }] }] } });

class CanvasComponent {
    facade = inject(StudioFacade);
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "20.3.33", ngImport: i0, type: CanvasComponent, deps: [], target: i0.ɵɵFactoryTarget.Component });
    static ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "17.0.0", version: "20.3.33", type: CanvasComponent, isStandalone: true, selector: "ds-canvas", ngImport: i0, template: `
    <div class="canvas" (click)="facade.picking() ? facade.cancelPick() : facade.select(null)">
      <div class="canvas__inner">
        @if (facade.root(); as root) {
          <div
            class="canvas__stack"
            dsSortable
            [options]="facade.treeSortOptions"
            [attr.data-ds-container-id]="root.id"
            (dsSortableDrop)="facade.applyDrop($event)"
          >
            @for (child of root.children; track child.id) {
              <div class="canvas__item ds-sortable-item" [attr.data-ds-node-id]="child.id">
                <ds-canvas-node [nodeId]="child.id" />
              </div>
            } @empty {
              <div class="canvas__empty">
                <div class="canvas__empty-glyph">
                  <span class="material-icons" aria-hidden="true">add_box</span>
                </div>
                <div class="canvas__empty-title">Empty canvas</div>
                <div class="canvas__empty-hint">Drag a component from the palette to start</div>
              </div>
            }
          </div>
        }
      </div>
    </div>
  `, isInline: true, styles: [":host{display:block;height:100%;min-height:320px}.canvas{position:relative;width:100%;height:100%;overflow:auto;background-color:var(--ds-canvas-bg);background-image:radial-gradient(circle at 1px 1px,var(--ds-grid-dot) 1px,transparent 0),radial-gradient(circle at 20% 10%,rgba(99,102,241,.08),transparent 45%),radial-gradient(circle at 80% 90%,rgba(14,165,233,.05),transparent 50%);background-size:20px 20px,auto,auto;color:var(--ds-text)}.canvas__inner{max-width:760px;margin:0 auto;padding:32px 24px 80px}.canvas__stack{display:flex;flex-direction:column;gap:12px;min-height:320px;border-radius:var(--ds-radius)}.canvas__empty{display:flex;flex-direction:column;align-items:center;justify-content:center;gap:10px;padding:72px 24px;border:1.5px dashed var(--ds-border-dashed);border-radius:var(--ds-radius);background:var(--ds-card-bg);color:var(--ds-text-muted);text-align:center;animation:ds-canvas-pulse 4s ease-in-out infinite;pointer-events:none}.canvas__empty-glyph{color:var(--ds-accent);opacity:.9}.canvas__empty-glyph .material-icons{font-size:36px}.canvas__empty-title{font-size:14px;font-weight:600;color:var(--ds-text)}.canvas__empty-hint{font-size:12px}:host ::ng-deep .ds-sortable-ghost{position:relative;opacity:.45}:host ::ng-deep .ds-sortable-ghost>*{visibility:hidden}:host ::ng-deep .ds-sortable-ghost:after{content:\"\";position:absolute;inset:0;background:var(--ds-accent-soft);border:1.5px dashed var(--ds-accent);border-radius:var(--ds-radius);pointer-events:none}:host ::ng-deep .ds-sortable-chosen{cursor:grabbing;opacity:.7}@keyframes ds-canvas-pulse{0%,to{border-color:var(--ds-border-dashed)}50%{border-color:var(--ds-accent)}}\n"], dependencies: [{ kind: "component", type: CanvasNodeComponent, selector: "ds-canvas-node", inputs: ["nodeId"] }, { kind: "directive", type: DsSortableDirective, selector: "[dsSortable]", inputs: ["options"], outputs: ["dsSortableDrop"] }], changeDetection: i0.ChangeDetectionStrategy.OnPush });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "20.3.33", ngImport: i0, type: CanvasComponent, decorators: [{
            type: Component,
            args: [{ selector: 'ds-canvas', standalone: true, imports: [CanvasNodeComponent, DsSortableDirective], changeDetection: ChangeDetectionStrategy.OnPush, template: `
    <div class="canvas" (click)="facade.picking() ? facade.cancelPick() : facade.select(null)">
      <div class="canvas__inner">
        @if (facade.root(); as root) {
          <div
            class="canvas__stack"
            dsSortable
            [options]="facade.treeSortOptions"
            [attr.data-ds-container-id]="root.id"
            (dsSortableDrop)="facade.applyDrop($event)"
          >
            @for (child of root.children; track child.id) {
              <div class="canvas__item ds-sortable-item" [attr.data-ds-node-id]="child.id">
                <ds-canvas-node [nodeId]="child.id" />
              </div>
            } @empty {
              <div class="canvas__empty">
                <div class="canvas__empty-glyph">
                  <span class="material-icons" aria-hidden="true">add_box</span>
                </div>
                <div class="canvas__empty-title">Empty canvas</div>
                <div class="canvas__empty-hint">Drag a component from the palette to start</div>
              </div>
            }
          </div>
        }
      </div>
    </div>
  `, styles: [":host{display:block;height:100%;min-height:320px}.canvas{position:relative;width:100%;height:100%;overflow:auto;background-color:var(--ds-canvas-bg);background-image:radial-gradient(circle at 1px 1px,var(--ds-grid-dot) 1px,transparent 0),radial-gradient(circle at 20% 10%,rgba(99,102,241,.08),transparent 45%),radial-gradient(circle at 80% 90%,rgba(14,165,233,.05),transparent 50%);background-size:20px 20px,auto,auto;color:var(--ds-text)}.canvas__inner{max-width:760px;margin:0 auto;padding:32px 24px 80px}.canvas__stack{display:flex;flex-direction:column;gap:12px;min-height:320px;border-radius:var(--ds-radius)}.canvas__empty{display:flex;flex-direction:column;align-items:center;justify-content:center;gap:10px;padding:72px 24px;border:1.5px dashed var(--ds-border-dashed);border-radius:var(--ds-radius);background:var(--ds-card-bg);color:var(--ds-text-muted);text-align:center;animation:ds-canvas-pulse 4s ease-in-out infinite;pointer-events:none}.canvas__empty-glyph{color:var(--ds-accent);opacity:.9}.canvas__empty-glyph .material-icons{font-size:36px}.canvas__empty-title{font-size:14px;font-weight:600;color:var(--ds-text)}.canvas__empty-hint{font-size:12px}:host ::ng-deep .ds-sortable-ghost{position:relative;opacity:.45}:host ::ng-deep .ds-sortable-ghost>*{visibility:hidden}:host ::ng-deep .ds-sortable-ghost:after{content:\"\";position:absolute;inset:0;background:var(--ds-accent-soft);border:1.5px dashed var(--ds-accent);border-radius:var(--ds-radius);pointer-events:none}:host ::ng-deep .ds-sortable-chosen{cursor:grabbing;opacity:.7}@keyframes ds-canvas-pulse{0%,to{border-color:var(--ds-border-dashed)}50%{border-color:var(--ds-accent)}}\n"] }]
        }] });

class SegmentedComponent {
    options = input.required(...(ngDevMode ? [{ debugName: "options" }] : []));
    value = input.required(...(ngDevMode ? [{ debugName: "value" }] : []));
    label = input(...(ngDevMode ? [undefined, { debugName: "label" }] : []));
    iconOnly = input(false, ...(ngDevMode ? [{ debugName: "iconOnly", transform: booleanAttribute }] : [{ transform: booleanAttribute }]));
    valueChange = output();
    activeIndex = computed(() => this.options().findIndex(option => option.value === this.value()), ...(ngDevMode ? [{ debugName: "activeIndex" }] : []));
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "20.3.33", ngImport: i0, type: SegmentedComponent, deps: [], target: i0.ɵɵFactoryTarget.Component });
    static ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "17.0.0", version: "20.3.33", type: SegmentedComponent, isStandalone: true, selector: "ds-segmented", inputs: { options: { classPropertyName: "options", publicName: "options", isSignal: true, isRequired: true, transformFunction: null }, value: { classPropertyName: "value", publicName: "value", isSignal: true, isRequired: true, transformFunction: null }, label: { classPropertyName: "label", publicName: "label", isSignal: true, isRequired: false, transformFunction: null }, iconOnly: { classPropertyName: "iconOnly", publicName: "iconOnly", isSignal: true, isRequired: false, transformFunction: null } }, outputs: { valueChange: "valueChange" }, host: { properties: { "class.segmented--icon-only": "iconOnly()" } }, ngImport: i0, template: `
    <div
      class="segmented"
      role="group"
      [style.--ds-segmented-count]="options().length"
      [style.--ds-segmented-index]="activeIndex()"
    >
      <span class="segmented__thumb" aria-hidden="true"></span>
      @for (option of options(); track option.value) {
        <button
          type="button"
          class="segmented__btn"
          [class.segmented__btn--active]="option.value === value()"
          [attr.aria-pressed]="option.value === value()"
          [title]="option.title"
          (click)="valueChange.emit(option.value)"
        >
          @if (option.icon) {
            <span class="material-icons" aria-hidden="true">{{ option.icon }}</span>
          }
          @if (!iconOnly()) {
            <span class="segmented__label">{{ option.title }}</span>
          }
        </button>
      }
    </div>
  `, isInline: true, styles: [":host{display:inline-flex;--ds-segmented-height: 28px}.segmented{position:relative;display:inline-grid;grid-auto-flow:column;grid-auto-columns:1fr;padding:3px;background:var(--ds-chip-bg);border:1px solid var(--ds-border);border-radius:999px}.segmented__thumb{position:absolute;top:3px;bottom:3px;left:3px;width:calc((100% - 6px) / var(--ds-segmented-count, 1));background:var(--ds-card-bg);border-radius:999px;box-shadow:var(--ds-card-shadow);transform:translate(calc(var(--ds-segmented-index, 0) * 100%));transition:transform .22s cubic-bezier(.2,.8,.2,1)}.segmented__btn{position:relative;display:inline-flex;align-items:center;justify-content:center;gap:6px;min-width:var(--ds-segmented-height);height:var(--ds-segmented-height);padding:0 14px;font:inherit;font-size:13px;font-weight:500;white-space:nowrap;color:var(--ds-text-muted);background:none;border:0;border-radius:999px;cursor:pointer;transition:color .14s ease}.segmented__btn .material-icons{font-size:16px}.segmented__btn:hover{color:var(--ds-text)}.segmented__btn--active,.segmented__btn--active:hover{color:var(--ds-accent)}.segmented__btn:focus-visible{outline:2px solid var(--ds-accent);outline-offset:1px}:host(.segmented--icon-only) .segmented__btn{width:var(--ds-segmented-height);padding:0}@media(prefers-reduced-motion:reduce){.segmented__thumb{transition:none}}\n"], changeDetection: i0.ChangeDetectionStrategy.OnPush });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "20.3.33", ngImport: i0, type: SegmentedComponent, decorators: [{
            type: Component,
            args: [{ selector: 'ds-segmented', standalone: true, changeDetection: ChangeDetectionStrategy.OnPush, host: { '[class.segmented--icon-only]': 'iconOnly()' }, template: `
    <div
      class="segmented"
      role="group"
      [style.--ds-segmented-count]="options().length"
      [style.--ds-segmented-index]="activeIndex()"
    >
      <span class="segmented__thumb" aria-hidden="true"></span>
      @for (option of options(); track option.value) {
        <button
          type="button"
          class="segmented__btn"
          [class.segmented__btn--active]="option.value === value()"
          [attr.aria-pressed]="option.value === value()"
          [title]="option.title"
          (click)="valueChange.emit(option.value)"
        >
          @if (option.icon) {
            <span class="material-icons" aria-hidden="true">{{ option.icon }}</span>
          }
          @if (!iconOnly()) {
            <span class="segmented__label">{{ option.title }}</span>
          }
        </button>
      }
    </div>
  `, styles: [":host{display:inline-flex;--ds-segmented-height: 28px}.segmented{position:relative;display:inline-grid;grid-auto-flow:column;grid-auto-columns:1fr;padding:3px;background:var(--ds-chip-bg);border:1px solid var(--ds-border);border-radius:999px}.segmented__thumb{position:absolute;top:3px;bottom:3px;left:3px;width:calc((100% - 6px) / var(--ds-segmented-count, 1));background:var(--ds-card-bg);border-radius:999px;box-shadow:var(--ds-card-shadow);transform:translate(calc(var(--ds-segmented-index, 0) * 100%));transition:transform .22s cubic-bezier(.2,.8,.2,1)}.segmented__btn{position:relative;display:inline-flex;align-items:center;justify-content:center;gap:6px;min-width:var(--ds-segmented-height);height:var(--ds-segmented-height);padding:0 14px;font:inherit;font-size:13px;font-weight:500;white-space:nowrap;color:var(--ds-text-muted);background:none;border:0;border-radius:999px;cursor:pointer;transition:color .14s ease}.segmented__btn .material-icons{font-size:16px}.segmented__btn:hover{color:var(--ds-text)}.segmented__btn--active,.segmented__btn--active:hover{color:var(--ds-accent)}.segmented__btn:focus-visible{outline:2px solid var(--ds-accent);outline-offset:1px}:host(.segmented--icon-only) .segmented__btn{width:var(--ds-segmented-height);padding:0}@media(prefers-reduced-motion:reduce){.segmented__thumb{transition:none}}\n"] }]
        }], propDecorators: { options: [{ type: i0.Input, args: [{ isSignal: true, alias: "options", required: true }] }], value: [{ type: i0.Input, args: [{ isSignal: true, alias: "value", required: true }] }], label: [{ type: i0.Input, args: [{ isSignal: true, alias: "label", required: false }] }], iconOnly: [{ type: i0.Input, args: [{ isSignal: true, alias: "iconOnly", required: false }] }], valueChange: [{ type: i0.Output, args: ["valueChange"] }] } });

function readStored(win, key, isValid, fallback) {
    try {
        const stored = win?.localStorage.getItem(key);
        return isValid(stored) ? stored : fallback;
    }
    catch {
        return fallback;
    }
}
function writeStored(win, key, value) {
    try {
        win?.localStorage.setItem(key, value);
    }
    catch {
        return;
    }
}

const STORAGE_KEY$1 = 'ds-studio:theme';
const DARK_QUERY = '(prefers-color-scheme: dark)';
const REDUCED_MOTION_QUERY = '(prefers-reduced-motion: reduce)';
const isPreference = (value) => value === 'system' || value === 'light' || value === 'dark';
class StudioTheme {
    #document = inject(DOCUMENT);
    #window = this.#document.defaultView;
    #appRef = inject(ApplicationRef);
    #systemQuery = this.#window?.matchMedia?.(DARK_QUERY) ?? null;
    #systemDark = signal(this.#systemQuery?.matches ?? false, ...(ngDevMode ? [{ debugName: "#systemDark" }] : []));
    #preference = signal(readStored(this.#window, STORAGE_KEY$1, isPreference, 'system'), ...(ngDevMode ? [{ debugName: "#preference" }] : []));
    preference = this.#preference.asReadonly();
    resolved = computed(() => this.#resolve(this.#preference()), ...(ngDevMode ? [{ debugName: "resolved" }] : []));
    constructor() {
        const query = this.#systemQuery;
        if (query) {
            const onChange = (event) => this.#apply(() => this.#systemDark.set(event.matches), this.#preference() === 'system');
            query.addEventListener('change', onChange);
            inject(DestroyRef).onDestroy(() => query.removeEventListener('change', onChange));
        }
        const overlayContainer = inject(OverlayContainer);
        effect(() => {
            overlayContainer.getContainerElement().dataset['dsTheme'] = this.resolved();
        });
    }
    set(preference) {
        if (preference === this.#preference())
            return;
        this.#apply(() => this.#preference.set(preference), this.#resolve(preference) !== this.resolved());
        writeStored(this.#window, STORAGE_KEY$1, preference);
    }
    #resolve(preference) {
        if (preference === 'system')
            return this.#systemDark() ? 'dark' : 'light';
        return preference;
    }
    #apply(update, changesTheme) {
        const startViewTransition = this.#document.startViewTransition?.bind(this.#document);
        const reducedMotion = this.#window?.matchMedia?.(REDUCED_MOTION_QUERY).matches ?? false;
        if (!changesTheme || !startViewTransition || reducedMotion)
            return update();
        startViewTransition(() => {
            update();
            this.#appRef.tick();
        });
    }
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "20.3.33", ngImport: i0, type: StudioTheme, deps: [], target: i0.ɵɵFactoryTarget.Injectable });
    static ɵprov = i0.ɵɵngDeclareInjectable({ minVersion: "12.0.0", version: "20.3.33", ngImport: i0, type: StudioTheme, providedIn: 'root' });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "20.3.33", ngImport: i0, type: StudioTheme, decorators: [{
            type: Injectable,
            args: [{ providedIn: 'root' }]
        }], ctorParameters: () => [] });

const OPTIONS$1 = [
    { value: 'system', title: 'System theme', icon: 'brightness_auto' },
    { value: 'light', title: 'Light theme', icon: 'light_mode' },
    { value: 'dark', title: 'Dark theme', icon: 'dark_mode' }
];
class ThemeToggleComponent {
    theme = inject(StudioTheme);
    options = OPTIONS$1;
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "20.3.33", ngImport: i0, type: ThemeToggleComponent, deps: [], target: i0.ɵɵFactoryTarget.Component });
    static ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "14.0.0", version: "20.3.33", type: ThemeToggleComponent, isStandalone: true, selector: "ds-theme-toggle", ngImport: i0, template: `
    <ds-segmented
      label="Color theme"
      iconOnly
      [options]="options"
      [value]="theme.preference()"
      (valueChange)="theme.set($event)"
    />
  `, isInline: true, dependencies: [{ kind: "component", type: SegmentedComponent, selector: "ds-segmented", inputs: ["options", "value", "label", "iconOnly"], outputs: ["valueChange"] }], changeDetection: i0.ChangeDetectionStrategy.OnPush });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "20.3.33", ngImport: i0, type: ThemeToggleComponent, decorators: [{
            type: Component,
            args: [{
                    selector: 'ds-theme-toggle',
                    standalone: true,
                    imports: [SegmentedComponent],
                    changeDetection: ChangeDetectionStrategy.OnPush,
                    template: `
    <ds-segmented
      label="Color theme"
      iconOnly
      [options]="options"
      [value]="theme.preference()"
      (valueChange)="theme.set($event)"
    />
  `
                }]
        }] });

const STORAGE_KEY = 'ds-studio:view';
const VIEWS = ['canvas', 'ast', 'preview', 'adapter'];
const isView = (value) => VIEWS.includes(value);
class StudioViews {
    #facade = inject(StudioFacade);
    #window = inject(DOCUMENT).defaultView;
    #preferred = signal(readStored(this.#window, STORAGE_KEY, isView, 'canvas'), ...(ngDevMode ? [{ debugName: "#preferred" }] : []));
    adapters = signal({}, ...(ngDevMode ? [{ debugName: "adapters" }] : []));
    hasPreview = signal(false, ...(ngDevMode ? [{ debugName: "hasPreview" }] : []));
    available = computed(() => VIEWS.filter(view => {
        if (view === 'preview')
            return this.hasPreview();
        if (view === 'adapter')
            return Object.keys(this.adapters()).length > 0;
        return true;
    }), ...(ngDevMode ? [{ debugName: "available" }] : []));
    current = computed(() => {
        const preferred = this.#preferred();
        return this.available().includes(preferred) ? preferred : 'canvas';
    }, ...(ngDevMode ? [{ debugName: "current" }] : []));
    results = computed(() => {
        if (!this.#facade.root())
            return [];
        return Object.entries(this.adapters()).map(([key, adapter]) => {
            const label = Studio.humanize(key);
            try {
                return { key, label, output: this.#facade.runAdapter(adapter), error: null };
            }
            catch (error) {
                return { key, label, output: undefined, error: error instanceof Error ? error.message : String(error) };
            }
        });
    }, ...(ngDevMode ? [{ debugName: "results" }] : []));
    outputs = computed(() => Object.fromEntries(this.results()
        .filter(result => !result.error)
        .map(result => [result.key, result.output])), ...(ngDevMode ? [{ debugName: "outputs" }] : []));
    set(view) {
        if (!this.available().includes(view))
            return;
        this.#facade.cancelPick();
        this.#preferred.set(view);
        writeStored(this.#window, STORAGE_KEY, view);
    }
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "20.3.33", ngImport: i0, type: StudioViews, deps: [], target: i0.ɵɵFactoryTarget.Injectable });
    static ɵprov = i0.ɵɵngDeclareInjectable({ minVersion: "12.0.0", version: "20.3.33", ngImport: i0, type: StudioViews });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "20.3.33", ngImport: i0, type: StudioViews, decorators: [{
            type: Injectable
        }] });

const OPTIONS = {
    canvas: { value: 'canvas', title: 'Canvas', icon: 'dashboard_customize' },
    ast: { value: 'ast', title: 'AST', icon: 'data_object' },
    preview: { value: 'preview', title: 'Preview', icon: 'visibility' },
    adapter: { value: 'adapter', title: 'Output', icon: 'transform' }
};
class ViewSwitcherComponent {
    views = inject(StudioViews);
    options = computed(() => this.views.available().map(view => OPTIONS[view]), ...(ngDevMode ? [{ debugName: "options" }] : []));
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "20.3.33", ngImport: i0, type: ViewSwitcherComponent, deps: [], target: i0.ɵɵFactoryTarget.Component });
    static ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "14.0.0", version: "20.3.33", type: ViewSwitcherComponent, isStandalone: true, selector: "ds-view-switcher", ngImport: i0, template: `
    <ds-segmented label="View" [options]="options()" [value]="views.current()" (valueChange)="views.set($event)" />
  `, isInline: true, dependencies: [{ kind: "component", type: SegmentedComponent, selector: "ds-segmented", inputs: ["options", "value", "label", "iconOnly"], outputs: ["valueChange"] }], changeDetection: i0.ChangeDetectionStrategy.OnPush });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "20.3.33", ngImport: i0, type: ViewSwitcherComponent, decorators: [{
            type: Component,
            args: [{
                    selector: 'ds-view-switcher',
                    standalone: true,
                    imports: [SegmentedComponent],
                    changeDetection: ChangeDetectionStrategy.OnPush,
                    template: `
    <ds-segmented label="View" [options]="options()" [value]="views.current()" (valueChange)="views.set($event)" />
  `
                }]
        }] });

class StudioHeaderComponent {
    facade = inject(StudioFacade);
    highlightErrors() {
        this.facade.highlight(this.facade.nodesWithErrors());
    }
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "20.3.33", ngImport: i0, type: StudioHeaderComponent, deps: [], target: i0.ɵɵFactoryTarget.Component });
    static ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "17.0.0", version: "20.3.33", type: StudioHeaderComponent, isStandalone: true, selector: "ds-studio-header", ngImport: i0, template: `
    <div class="header__brand">
      <span class="header__dot"></span>
      <span class="header__title">Studio</span>
    </div>
    <div class="header__center">
      <ds-view-switcher />
    </div>
    <div class="header__actions">
      @if (facade.errorCount(); as count) {
        <button type="button" class="header__issues" (click)="highlightErrors()" (mouseleave)="facade.clearHighlight()">
          <span class="material-icons" aria-hidden="true">error</span>
          {{ count }} {{ count === 1 ? 'issue' : 'issues' }}
        </button>
      }
      <ds-theme-toggle />
    </div>
  `, isInline: true, styles: [":host{display:grid;grid-template-columns:minmax(0,1fr) auto minmax(0,1fr);align-items:center;gap:12px;height:52px;padding:0 16px;box-sizing:border-box;background:var(--ds-card-bg);border-bottom:1px solid var(--ds-border)}.header__brand{display:flex;align-items:center;gap:10px;min-width:0}.header__dot{width:18px;height:18px;border-radius:6px;background:var(--ds-accent);box-shadow:0 0 0 4px var(--ds-accent-soft);flex:0 0 auto}.header__title{font-size:14px;font-weight:600;letter-spacing:.01em;color:var(--ds-text)}.header__center{display:flex;justify-content:center}.header__actions{display:flex;align-items:center;justify-content:flex-end;gap:8px}.header__issues{display:inline-flex;align-items:center;gap:4px;height:28px;padding:0 10px 0 8px;font-size:12px;font-weight:600;font-variant-numeric:tabular-nums;color:#ef4444;background:#ef44441a;border:none;border-radius:999px;cursor:pointer;transition:background .12s ease}.header__issues .material-icons{font-size:15px}.header__issues:hover,.header__issues:focus-visible{background:#ef44442e;outline:none}\n"], dependencies: [{ kind: "component", type: ThemeToggleComponent, selector: "ds-theme-toggle" }, { kind: "component", type: ViewSwitcherComponent, selector: "ds-view-switcher" }], changeDetection: i0.ChangeDetectionStrategy.OnPush });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "20.3.33", ngImport: i0, type: StudioHeaderComponent, decorators: [{
            type: Component,
            args: [{ selector: 'ds-studio-header', standalone: true, imports: [ThemeToggleComponent, ViewSwitcherComponent], changeDetection: ChangeDetectionStrategy.OnPush, template: `
    <div class="header__brand">
      <span class="header__dot"></span>
      <span class="header__title">Studio</span>
    </div>
    <div class="header__center">
      <ds-view-switcher />
    </div>
    <div class="header__actions">
      @if (facade.errorCount(); as count) {
        <button type="button" class="header__issues" (click)="highlightErrors()" (mouseleave)="facade.clearHighlight()">
          <span class="material-icons" aria-hidden="true">error</span>
          {{ count }} {{ count === 1 ? 'issue' : 'issues' }}
        </button>
      }
      <ds-theme-toggle />
    </div>
  `, styles: [":host{display:grid;grid-template-columns:minmax(0,1fr) auto minmax(0,1fr);align-items:center;gap:12px;height:52px;padding:0 16px;box-sizing:border-box;background:var(--ds-card-bg);border-bottom:1px solid var(--ds-border)}.header__brand{display:flex;align-items:center;gap:10px;min-width:0}.header__dot{width:18px;height:18px;border-radius:6px;background:var(--ds-accent);box-shadow:0 0 0 4px var(--ds-accent-soft);flex:0 0 auto}.header__title{font-size:14px;font-weight:600;letter-spacing:.01em;color:var(--ds-text)}.header__center{display:flex;justify-content:center}.header__actions{display:flex;align-items:center;justify-content:flex-end;gap:8px}.header__issues{display:inline-flex;align-items:center;gap:4px;height:28px;padding:0 10px 0 8px;font-size:12px;font-weight:600;font-variant-numeric:tabular-nums;color:#ef4444;background:#ef44441a;border:none;border-radius:999px;cursor:pointer;transition:background .12s ease}.header__issues .material-icons{font-size:15px}.header__issues:hover,.header__issues:focus-visible{background:#ef44442e;outline:none}\n"] }]
        }] });

class MetaFieldsComponent {
    #facade = inject(StudioFacade);
    node = input.required(...(ngDevMode ? [{ debugName: "node" }] : []));
    definition = input.required(...(ngDevMode ? [{ debugName: "definition" }] : []));
    changed = output();
    iconValue = computed(() => this.node().icon ?? '', ...(ngDevMode ? [{ debugName: "iconValue" }] : []));
    fieldNameValue = computed(() => this.node().fieldName ?? '', ...(ngDevMode ? [{ debugName: "fieldNameValue" }] : []));
    defaultIcon = computed(() => iconOrDefault(this.definition().icon, this.definition()), ...(ngDevMode ? [{ debugName: "defaultIcon" }] : []));
    effectiveIcon = computed(() => this.#facade.iconOf(this.node()), ...(ngDevMode ? [{ debugName: "effectiveIcon" }] : []));
    onIconInput(event) {
        this.changed.emit({ icon: event.target.value.trim() });
    }
    onFieldNameInput(event) {
        this.changed.emit({ fieldName: event.target.value });
    }
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "20.3.33", ngImport: i0, type: MetaFieldsComponent, deps: [], target: i0.ɵɵFactoryTarget.Component });
    static ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "17.1.0", version: "20.3.33", type: MetaFieldsComponent, isStandalone: true, selector: "ds-meta-fields", inputs: { node: { classPropertyName: "node", publicName: "node", isSignal: true, isRequired: true, transformFunction: null }, definition: { classPropertyName: "definition", publicName: "definition", isSignal: true, isRequired: true, transformFunction: null } }, outputs: { changed: "changed" }, ngImport: i0, template: `
    <div class="meta">
      <mat-form-field appearance="outline" class="ds-field" subscriptSizing="dynamic">
        <mat-label>Field Name</mat-label>
        <input
          matInput
          type="text"
          [value]="fieldNameValue()"
          placeholder="firstName"
          spellcheck="false"
          autocomplete="off"
          (input)="onFieldNameInput($event)"
        />
        <mat-hint>Key of the value in the output, e.g. <code>firstName</code>, <code>lastName</code></mat-hint>
      </mat-form-field>

      <div class="meta__row">
        <div class="meta__icon-preview" [title]="effectiveIcon()">
          <mat-icon>{{ effectiveIcon() }}</mat-icon>
        </div>

        <mat-form-field appearance="outline" class="ds-field" subscriptSizing="dynamic">
          <mat-label>Icon</mat-label>
          <input
            matInput
            type="text"
            [value]="iconValue()"
            [placeholder]="defaultIcon()"
            spellcheck="false"
            autocomplete="off"
            (input)="onIconInput($event)"
          />
          <mat-hint> Material Icons ligature, e.g. <code>check_box</code> </mat-hint>
        </mat-form-field>
      </div>
    </div>
  `, isInline: true, styles: [":host{display:block}.meta{display:flex;flex-direction:column;gap:12px}.meta__row{display:flex;align-items:flex-start;gap:12px}.meta__icon-preview{display:inline-flex;align-items:center;justify-content:center;width:40px;height:40px;flex:0 0 auto;color:var(--ds-accent);background:var(--ds-accent-soft);border:1px solid var(--ds-border);border-radius:var(--ds-radius-sm);transition:background .16s ease,border-color .16s ease}.meta__icon-preview mat-icon{font-size:20px;width:20px;height:20px}.meta code{padding:1px 5px;font-size:10px;background:var(--ds-chip-bg);border-radius:4px;font-family:Roboto Mono,ui-monospace,SF Mono,Menlo,monospace}:host ::ng-deep .ds-field{width:100%;display:block}:host ::ng-deep .mat-mdc-form-field .mat-mdc-text-field-wrapper{padding-bottom:0}:host ::ng-deep .mat-mdc-form-field .mat-mdc-form-field-subscript-wrapper{font-size:10px}\n"], dependencies: [{ kind: "ngmodule", type: MatFormFieldModule }, { kind: "component", type: i1.MatFormField, selector: "mat-form-field", inputs: ["hideRequiredMarker", "color", "floatLabel", "appearance", "subscriptSizing", "hintLabel"], exportAs: ["matFormField"] }, { kind: "directive", type: i1.MatLabel, selector: "mat-label" }, { kind: "directive", type: i1.MatHint, selector: "mat-hint", inputs: ["align", "id"] }, { kind: "ngmodule", type: MatInputModule }, { kind: "directive", type: i2.MatInput, selector: "input[matInput], textarea[matInput], select[matNativeControl],      input[matNativeControl], textarea[matNativeControl]", inputs: ["disabled", "id", "placeholder", "name", "required", "type", "errorStateMatcher", "aria-describedby", "value", "readonly", "disabledInteractive"], exportAs: ["matInput"] }, { kind: "ngmodule", type: MatIconModule }, { kind: "component", type: i3.MatIcon, selector: "mat-icon", inputs: ["color", "inline", "svgIcon", "fontSet", "fontIcon"], exportAs: ["matIcon"] }], changeDetection: i0.ChangeDetectionStrategy.OnPush });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "20.3.33", ngImport: i0, type: MetaFieldsComponent, decorators: [{
            type: Component,
            args: [{ selector: 'ds-meta-fields', standalone: true, imports: [MatFormFieldModule, MatInputModule, MatIconModule], changeDetection: ChangeDetectionStrategy.OnPush, template: `
    <div class="meta">
      <mat-form-field appearance="outline" class="ds-field" subscriptSizing="dynamic">
        <mat-label>Field Name</mat-label>
        <input
          matInput
          type="text"
          [value]="fieldNameValue()"
          placeholder="firstName"
          spellcheck="false"
          autocomplete="off"
          (input)="onFieldNameInput($event)"
        />
        <mat-hint>Key of the value in the output, e.g. <code>firstName</code>, <code>lastName</code></mat-hint>
      </mat-form-field>

      <div class="meta__row">
        <div class="meta__icon-preview" [title]="effectiveIcon()">
          <mat-icon>{{ effectiveIcon() }}</mat-icon>
        </div>

        <mat-form-field appearance="outline" class="ds-field" subscriptSizing="dynamic">
          <mat-label>Icon</mat-label>
          <input
            matInput
            type="text"
            [value]="iconValue()"
            [placeholder]="defaultIcon()"
            spellcheck="false"
            autocomplete="off"
            (input)="onIconInput($event)"
          />
          <mat-hint> Material Icons ligature, e.g. <code>check_box</code> </mat-hint>
        </mat-form-field>
      </div>
    </div>
  `, styles: [":host{display:block}.meta{display:flex;flex-direction:column;gap:12px}.meta__row{display:flex;align-items:flex-start;gap:12px}.meta__icon-preview{display:inline-flex;align-items:center;justify-content:center;width:40px;height:40px;flex:0 0 auto;color:var(--ds-accent);background:var(--ds-accent-soft);border:1px solid var(--ds-border);border-radius:var(--ds-radius-sm);transition:background .16s ease,border-color .16s ease}.meta__icon-preview mat-icon{font-size:20px;width:20px;height:20px}.meta code{padding:1px 5px;font-size:10px;background:var(--ds-chip-bg);border-radius:4px;font-family:Roboto Mono,ui-monospace,SF Mono,Menlo,monospace}:host ::ng-deep .ds-field{width:100%;display:block}:host ::ng-deep .mat-mdc-form-field .mat-mdc-text-field-wrapper{padding-bottom:0}:host ::ng-deep .mat-mdc-form-field .mat-mdc-form-field-subscript-wrapper{font-size:10px}\n"] }]
        }], propDecorators: { node: [{ type: i0.Input, args: [{ isSignal: true, alias: "node", required: true }] }], definition: [{ type: i0.Input, args: [{ isSignal: true, alias: "definition", required: true }] }], changed: [{ type: i0.Output, args: ["changed"] }] } });

class CheckboxFieldComponent {
    label = input.required(...(ngDevMode ? [{ debugName: "label" }] : []));
    primitive = input.required(...(ngDevMode ? [{ debugName: "primitive" }] : []));
    value = input(...(ngDevMode ? [undefined, { debugName: "value" }] : []));
    errors = input([], ...(ngDevMode ? [{ debugName: "errors" }] : []));
    valueChange = output();
    effective = computed(() => this.value() ?? this.primitive().default ?? false, ...(ngDevMode ? [{ debugName: "effective" }] : []));
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "20.3.33", ngImport: i0, type: CheckboxFieldComponent, deps: [], target: i0.ɵɵFactoryTarget.Component });
    static ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "17.0.0", version: "20.3.33", type: CheckboxFieldComponent, isStandalone: true, selector: "ds-checkbox-field", inputs: { label: { classPropertyName: "label", publicName: "label", isSignal: true, isRequired: true, transformFunction: null }, primitive: { classPropertyName: "primitive", publicName: "primitive", isSignal: true, isRequired: true, transformFunction: null }, value: { classPropertyName: "value", publicName: "value", isSignal: true, isRequired: false, transformFunction: null }, errors: { classPropertyName: "errors", publicName: "errors", isSignal: true, isRequired: false, transformFunction: null } }, outputs: { valueChange: "valueChange" }, ngImport: i0, template: `
    <mat-checkbox class="ds-checkbox" [checked]="effective()" (change)="valueChange.emit($event.checked)">{{
      label()
    }}</mat-checkbox>
    @if (errors().length) {
      @for (message of errors(); track message) {
        <div class="ds-error">{{ message }}</div>
      }
    } @else if (primitive().hint ?? primitive().description; as hint) {
      <div class="ds-hint">{{ hint }}</div>
    }
  `, isInline: true, dependencies: [{ kind: "ngmodule", type: MatCheckboxModule }, { kind: "component", type: i1$1.MatCheckbox, selector: "mat-checkbox", inputs: ["aria-label", "aria-labelledby", "aria-describedby", "aria-expanded", "aria-controls", "aria-owns", "id", "required", "labelPosition", "name", "value", "disableRipple", "tabIndex", "color", "disabledInteractive", "checked", "disabled", "indeterminate"], outputs: ["change", "indeterminateChange"], exportAs: ["matCheckbox"] }], changeDetection: i0.ChangeDetectionStrategy.OnPush });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "20.3.33", ngImport: i0, type: CheckboxFieldComponent, decorators: [{
            type: Component,
            args: [{
                    selector: 'ds-checkbox-field',
                    standalone: true,
                    imports: [MatCheckboxModule],
                    changeDetection: ChangeDetectionStrategy.OnPush,
                    template: `
    <mat-checkbox class="ds-checkbox" [checked]="effective()" (change)="valueChange.emit($event.checked)">{{
      label()
    }}</mat-checkbox>
    @if (errors().length) {
      @for (message of errors(); track message) {
        <div class="ds-error">{{ message }}</div>
      }
    } @else if (primitive().hint ?? primitive().description; as hint) {
      <div class="ds-hint">{{ hint }}</div>
    }
  `
                }]
        }], propDecorators: { label: [{ type: i0.Input, args: [{ isSignal: true, alias: "label", required: true }] }], primitive: [{ type: i0.Input, args: [{ isSignal: true, alias: "primitive", required: true }] }], value: [{ type: i0.Input, args: [{ isSignal: true, alias: "value", required: false }] }], errors: [{ type: i0.Input, args: [{ isSignal: true, alias: "errors", required: false }] }], valueChange: [{ type: i0.Output, args: ["valueChange"] }] } });

const codeHighlightStyle = HighlightStyle.define([
    { tag: tags.propertyName, color: 'var(--ds-code-key)' },
    { tag: tags.string, color: 'var(--ds-code-string)' },
    { tag: [tags.number, tags.integer, tags.float], color: 'var(--ds-code-number)' },
    { tag: [tags.bool, tags.null, tags.atom], color: 'var(--ds-code-keyword)' },
    { tag: [tags.punctuation, tags.separator, tags.squareBracket, tags.brace], color: 'var(--ds-code-punctuation)' }
]);
const codeEditorTheme = EditorView.theme({
    '&': { fontSize: '12px', color: 'var(--ds-text)', backgroundColor: 'transparent' },
    '&.cm-focused': { outline: 'none' },
    '.cm-scroller': { fontFamily: 'var(--ds-code-font)', lineHeight: '20px' },
    '.cm-content': { padding: '8px 0', caretColor: 'var(--ds-accent)' },
    '.cm-line': { padding: '0 12px 0 8px' },
    '.cm-cursor': { borderLeftColor: 'var(--ds-accent)' },
    '&.cm-focused > .cm-scroller > .cm-selectionLayer .cm-selectionBackground, .cm-selectionBackground': {
        background: 'var(--ds-accent-soft)'
    },
    '&.cm-focused .cm-activeLine': { backgroundColor: 'var(--ds-chip-bg)' },
    '.cm-activeLine': { backgroundColor: 'transparent' },
    '.cm-gutters': {
        backgroundColor: 'var(--ds-chip-bg)',
        color: 'var(--ds-text-muted)',
        border: 'none',
        borderRight: '1px solid var(--ds-border)'
    },
    '.cm-activeLineGutter': { backgroundColor: 'transparent' },
    '&.cm-focused .cm-activeLineGutter': { color: 'var(--ds-text)' },
    '.cm-lineNumbers .cm-gutterElement': { minWidth: '28px', padding: '0 8px 0 10px' },
    '.cm-placeholder': { color: 'var(--ds-text-muted)' },
    '.cm-matchingBracket': { backgroundColor: 'var(--ds-accent-soft)', outline: '1px solid var(--ds-accent-ring)' },
    '.cm-lintRange-error': { backgroundImage: 'none', textDecoration: 'underline wavy var(--ds-code-error)' },
    '.cm-tooltip': {
        border: '1px solid var(--ds-border)',
        borderRadius: '8px',
        backgroundColor: 'var(--ds-card-bg)',
        color: 'var(--ds-text)',
        boxShadow: 'var(--ds-card-shadow-hover)',
        overflow: 'hidden'
    }
});

const INDENT = 2;
const fieldSizing = EditorView.theme({
    '&': { minHeight: '88px' },
    '.cm-scroller': { maxHeight: '320px' }
});
class CodeFieldComponent {
    label = input.required(...(ngDevMode ? [{ debugName: "label" }] : []));
    primitive = input.required(...(ngDevMode ? [{ debugName: "primitive" }] : []));
    value = input(...(ngDevMode ? [undefined, { debugName: "value" }] : []));
    errors = input([], ...(ngDevMode ? [{ debugName: "errors" }] : []));
    valueChange = output();
    host = viewChild.required('host');
    #view;
    #syncing = false;
    focused = signal(false, ...(ngDevMode ? [{ debugName: "focused" }] : []));
    #source = signal('', ...(ngDevMode ? [{ debugName: "#source" }] : []));
    error = computed(() => validateJson(this.#source()), ...(ngDevMode ? [{ debugName: "error" }] : []));
    canFormat = computed(() => this.#source().trim() !== '' && !this.error(), ...(ngDevMode ? [{ debugName: "canFormat" }] : []));
    constructor() {
        const destroyRef = inject(DestroyRef);
        afterNextRender(() => {
            const initial = this.#currentValue();
            this.#source.set(initial);
            this.#view = new EditorView({
                parent: this.host().nativeElement,
                state: EditorState.create({
                    doc: initial,
                    extensions: [
                        lineNumbers(),
                        EditorView.lineWrapping,
                        history(),
                        drawSelection(),
                        highlightActiveLine(),
                        indentOnInput(),
                        bracketMatching(),
                        closeBrackets(),
                        json(),
                        linter(jsonParseLinter()),
                        syntaxHighlighting(codeHighlightStyle),
                        placeholder(this.primitive().default ?? '{ }'),
                        EditorState.tabSize.of(INDENT),
                        keymap.of([...closeBracketsKeymap, ...defaultKeymap, ...historyKeymap]),
                        codeEditorTheme,
                        fieldSizing,
                        EditorView.updateListener.of(update => {
                            if (update.focusChanged)
                                this.focused.set(update.view.hasFocus);
                            if (!update.docChanged || this.#syncing)
                                return;
                            const doc = update.state.doc.toString();
                            this.#source.set(doc);
                            this.valueChange.emit(doc);
                        })
                    ]
                })
            });
        });
        effect(() => {
            const next = this.#currentValue();
            const view = this.#view;
            if (!view || next === view.state.doc.toString())
                return;
            this.#syncing = true;
            try {
                view.dispatch({ changes: { from: 0, to: view.state.doc.length, insert: next } });
            }
            finally {
                this.#syncing = false;
            }
            this.#source.set(next);
        });
        destroyRef.onDestroy(() => this.#view?.destroy());
    }
    format() {
        const view = this.#view;
        if (!view || !this.canFormat())
            return;
        const formatted = JSON.stringify(JSON.parse(view.state.doc.toString()), null, INDENT);
        view.dispatch({ changes: { from: 0, to: view.state.doc.length, insert: formatted } });
    }
    #currentValue() {
        return this.value() ?? '';
    }
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "20.3.33", ngImport: i0, type: CodeFieldComponent, deps: [], target: i0.ɵɵFactoryTarget.Component });
    static ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "17.0.0", version: "20.3.33", type: CodeFieldComponent, isStandalone: true, selector: "ds-code-field", inputs: { label: { classPropertyName: "label", publicName: "label", isSignal: true, isRequired: true, transformFunction: null }, primitive: { classPropertyName: "primitive", publicName: "primitive", isSignal: true, isRequired: true, transformFunction: null }, value: { classPropertyName: "value", publicName: "value", isSignal: true, isRequired: false, transformFunction: null }, errors: { classPropertyName: "errors", publicName: "errors", isSignal: true, isRequired: false, transformFunction: null } }, outputs: { valueChange: "valueChange" }, viewQueries: [{ propertyName: "host", first: true, predicate: ["host"], descendants: true, isSignal: true }], ngImport: i0, template: `
    <div class="ds-code" [class.ds-code--invalid]="error() || errors().length" [class.ds-code--focused]="focused()">
      <div class="ds-code__header">
        <span class="ds-code__label">{{ label() }}</span>
        <span class="ds-code__badge">JSON</span>
        <button
          mat-icon-button
          type="button"
          class="ds-code__format"
          matTooltip="Format JSON"
          [disabled]="!canFormat()"
          (click)="format()"
        >
          <mat-icon>format_align_left</mat-icon>
        </button>
      </div>
      <div #host class="ds-code__editor"></div>
      <div class="ds-code__footer">
        @if (error(); as message) {
          <mat-icon class="ds-code__footer-icon">error</mat-icon>
          <span class="ds-code__error" role="alert">{{ message }}</span>
        } @else if (errors().length) {
          <mat-icon class="ds-code__footer-icon">error</mat-icon>
          <span class="ds-code__error" role="alert">{{ errors().join(', ') }}</span>
        } @else if (primitive().hint ?? primitive().description; as hint) {
          <span class="ds-code__hint">{{ hint }}</span>
        }
      </div>
    </div>
  `, isInline: true, styles: [":host{display:block;width:100%;--ds-code-font: \"JetBrains Mono\", \"SF Mono\", ui-monospace, Menlo, Consolas, monospace}.ds-code{display:flex;flex-direction:column;border:1px solid var(--mat-sys-outline, var(--ds-border));border-radius:var(--ds-radius-sm);background:var(--ds-card-bg);overflow:hidden;transition:border-color .12s ease,box-shadow .12s ease}.ds-code:hover:not(.ds-code--focused){border-color:var(--ds-text-muted)}.ds-code--focused{border-color:var(--ds-accent);box-shadow:0 0 0 3px var(--ds-accent-ring)}.ds-code--invalid{border-color:var(--ds-code-error)}.ds-code--invalid.ds-code--focused{box-shadow:0 0 0 3px color-mix(in srgb,var(--ds-code-error) 28%,transparent)}.ds-code__header{display:flex;align-items:center;gap:8px;min-height:40px;padding:0 8px 0 12px;background:var(--ds-card-bg-container);border-bottom:1px solid var(--ds-border)}.ds-code__label{flex:1;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;font-size:11px;font-weight:600;letter-spacing:.02em;text-transform:uppercase;color:var(--ds-text-muted)}.ds-code__badge{padding:1px 6px;font:600 10px/16px var(--ds-code-font);letter-spacing:.04em;color:var(--ds-accent);background:var(--ds-accent-soft);border-radius:6px}.ds-code__format{--mat-icon-button-state-layer-size: 28px;width:28px;height:28px;padding:0;display:inline-flex;align-items:center;justify-content:center;color:var(--ds-text-muted)}.ds-code__format mat-icon{width:18px;height:18px;font-size:18px;line-height:18px}.ds-code__editor{display:flex;flex-direction:column}.ds-code__editor ::ng-deep .cm-editor{flex:1}.ds-code__footer{display:flex;align-items:flex-start;gap:6px;padding:0 12px;font-size:12px;line-height:16px;color:var(--ds-text-muted)}.ds-code__footer:not(:empty){padding-top:6px;padding-bottom:8px;border-top:1px solid var(--ds-border);background:var(--ds-card-bg-container)}.ds-code__footer-icon{flex:none;width:14px;height:14px;font-size:14px;color:var(--ds-code-error)}.ds-code__error{min-width:0;color:var(--ds-code-error);overflow-wrap:anywhere}\n"], dependencies: [{ kind: "ngmodule", type: MatButtonModule }, { kind: "component", type: i1$2.MatIconButton, selector: "button[mat-icon-button], a[mat-icon-button], button[matIconButton], a[matIconButton]", exportAs: ["matButton", "matAnchor"] }, { kind: "ngmodule", type: MatIconModule }, { kind: "component", type: i3.MatIcon, selector: "mat-icon", inputs: ["color", "inline", "svgIcon", "fontSet", "fontIcon"], exportAs: ["matIcon"] }, { kind: "ngmodule", type: MatTooltipModule }, { kind: "directive", type: i3$1.MatTooltip, selector: "[matTooltip]", inputs: ["matTooltipPosition", "matTooltipPositionAtOrigin", "matTooltipDisabled", "matTooltipShowDelay", "matTooltipHideDelay", "matTooltipTouchGestures", "matTooltip", "matTooltipClass"], exportAs: ["matTooltip"] }], changeDetection: i0.ChangeDetectionStrategy.OnPush });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "20.3.33", ngImport: i0, type: CodeFieldComponent, decorators: [{
            type: Component,
            args: [{ selector: 'ds-code-field', standalone: true, imports: [MatButtonModule, MatIconModule, MatTooltipModule], changeDetection: ChangeDetectionStrategy.OnPush, template: `
    <div class="ds-code" [class.ds-code--invalid]="error() || errors().length" [class.ds-code--focused]="focused()">
      <div class="ds-code__header">
        <span class="ds-code__label">{{ label() }}</span>
        <span class="ds-code__badge">JSON</span>
        <button
          mat-icon-button
          type="button"
          class="ds-code__format"
          matTooltip="Format JSON"
          [disabled]="!canFormat()"
          (click)="format()"
        >
          <mat-icon>format_align_left</mat-icon>
        </button>
      </div>
      <div #host class="ds-code__editor"></div>
      <div class="ds-code__footer">
        @if (error(); as message) {
          <mat-icon class="ds-code__footer-icon">error</mat-icon>
          <span class="ds-code__error" role="alert">{{ message }}</span>
        } @else if (errors().length) {
          <mat-icon class="ds-code__footer-icon">error</mat-icon>
          <span class="ds-code__error" role="alert">{{ errors().join(', ') }}</span>
        } @else if (primitive().hint ?? primitive().description; as hint) {
          <span class="ds-code__hint">{{ hint }}</span>
        }
      </div>
    </div>
  `, styles: [":host{display:block;width:100%;--ds-code-font: \"JetBrains Mono\", \"SF Mono\", ui-monospace, Menlo, Consolas, monospace}.ds-code{display:flex;flex-direction:column;border:1px solid var(--mat-sys-outline, var(--ds-border));border-radius:var(--ds-radius-sm);background:var(--ds-card-bg);overflow:hidden;transition:border-color .12s ease,box-shadow .12s ease}.ds-code:hover:not(.ds-code--focused){border-color:var(--ds-text-muted)}.ds-code--focused{border-color:var(--ds-accent);box-shadow:0 0 0 3px var(--ds-accent-ring)}.ds-code--invalid{border-color:var(--ds-code-error)}.ds-code--invalid.ds-code--focused{box-shadow:0 0 0 3px color-mix(in srgb,var(--ds-code-error) 28%,transparent)}.ds-code__header{display:flex;align-items:center;gap:8px;min-height:40px;padding:0 8px 0 12px;background:var(--ds-card-bg-container);border-bottom:1px solid var(--ds-border)}.ds-code__label{flex:1;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;font-size:11px;font-weight:600;letter-spacing:.02em;text-transform:uppercase;color:var(--ds-text-muted)}.ds-code__badge{padding:1px 6px;font:600 10px/16px var(--ds-code-font);letter-spacing:.04em;color:var(--ds-accent);background:var(--ds-accent-soft);border-radius:6px}.ds-code__format{--mat-icon-button-state-layer-size: 28px;width:28px;height:28px;padding:0;display:inline-flex;align-items:center;justify-content:center;color:var(--ds-text-muted)}.ds-code__format mat-icon{width:18px;height:18px;font-size:18px;line-height:18px}.ds-code__editor{display:flex;flex-direction:column}.ds-code__editor ::ng-deep .cm-editor{flex:1}.ds-code__footer{display:flex;align-items:flex-start;gap:6px;padding:0 12px;font-size:12px;line-height:16px;color:var(--ds-text-muted)}.ds-code__footer:not(:empty){padding-top:6px;padding-bottom:8px;border-top:1px solid var(--ds-border);background:var(--ds-card-bg-container)}.ds-code__footer-icon{flex:none;width:14px;height:14px;font-size:14px;color:var(--ds-code-error)}.ds-code__error{min-width:0;color:var(--ds-code-error);overflow-wrap:anywhere}\n"] }]
        }], ctorParameters: () => [], propDecorators: { label: [{ type: i0.Input, args: [{ isSignal: true, alias: "label", required: true }] }], primitive: [{ type: i0.Input, args: [{ isSignal: true, alias: "primitive", required: true }] }], value: [{ type: i0.Input, args: [{ isSignal: true, alias: "value", required: false }] }], errors: [{ type: i0.Input, args: [{ isSignal: true, alias: "errors", required: false }] }], valueChange: [{ type: i0.Output, args: ["valueChange"] }], host: [{ type: i0.ViewChild, args: ['host', { isSignal: true }] }] } });
function validateJson(source) {
    if (source.trim() === '')
        return null;
    try {
        JSON.parse(source);
        return null;
    }
    catch (e) {
        return e instanceof Error ? e.message : 'Invalid JSON';
    }
}

const DEFAULT_DATE_FORMAT = 'shortDate';
const ISO_DATE = 'yyyy-MM-dd';
const ISO_TIME = 'HH:mm';
const NAMED_FORMATS = {
    shortDate: FormatWidth.Short,
    mediumDate: FormatWidth.Medium,
    longDate: FormatWidth.Long,
    fullDate: FormatWidth.Full
};
const MOMENT_TOKENS = { YYYY: 'yyyy', YY: 'yy', DD: 'dd', D: 'd' };
function toDatePattern(formatName, locale) {
    const requested = formatName ?? DEFAULT_DATE_FORMAT;
    const width = NAMED_FORMATS[requested];
    if (width !== undefined) {
        try {
            return getLocaleDateFormat(locale, width);
        }
        catch {
            return getLocaleDateFormat('en-US', width);
        }
    }
    return requested
        .split(/('[^']*')/)
        .map((part, i) => (i % 2 ? part : part.replace(/YYYY|YY|DD|D/g, token => MOMENT_TOKENS[token])))
        .join('');
}
function fromIsoDate(value) {
    if (!value)
        return null;
    const date = parseISO(value);
    return isValid(date) ? date : null;
}
function toIsoDate(value) {
    return value && isValid(value) ? format(value, ISO_DATE) : null;
}
function fromIsoTime(value) {
    if (!value)
        return null;
    const date = parse(value, ISO_TIME, new Date());
    return isValid(date) ? date : null;
}
function toIsoTime(value) {
    return value && isValid(value) ? format(value, ISO_TIME) : null;
}
function provideDateFnsFieldAdapter() {
    return [provideDateFnsAdapter(), { provide: MAT_DATE_LOCALE, useValue: enUS }];
}
function dateFormatsFrom(pattern) {
    return {
        parse: {
            get dateInput() {
                return pattern();
            }
        },
        display: {
            get dateInput() {
                return pattern();
            },
            monthYearLabel: 'LLL uuuu',
            dateA11yLabel: 'PP',
            monthYearA11yLabel: 'LLLL uuuu'
        }
    };
}

class DateFieldComponent {
    label = input.required(...(ngDevMode ? [{ debugName: "label" }] : []));
    primitive = input.required(...(ngDevMode ? [{ debugName: "primitive" }] : []));
    value = input(...(ngDevMode ? [undefined, { debugName: "value" }] : []));
    errors = input([], ...(ngDevMode ? [{ debugName: "errors" }] : []));
    valueChange = output();
    #locale = inject(LOCALE_ID);
    range = computed(() => this.primitive().range ?? false, ...(ngDevMode ? [{ debugName: "range" }] : []));
    pattern = computed(() => toDatePattern(this.primitive().format, this.#locale), ...(ngDevMode ? [{ debugName: "pattern" }] : []));
    startPlaceholder = computed(() => `Start ${this.pattern().toLowerCase()}`, ...(ngDevMode ? [{ debugName: "startPlaceholder" }] : []));
    endPlaceholder = computed(() => `End ${this.pattern().toLowerCase()}`, ...(ngDevMode ? [{ debugName: "endPlaceholder" }] : []));
    control = new FormControl(null);
    rangeControl = new FormGroup({
        start: new FormControl(null),
        end: new FormControl(null)
    });
    constructor() {
        const destroyRef = inject(DestroyRef);
        effect(() => {
            const value = this.value() ?? this.primitive().default ?? null;
            if (this.range()) {
                const { start, end } = isRange(value) ? value : { start: null, end: null };
                this.rangeControl.setValue({ start: fromIsoDate(start), end: fromIsoDate(end) }, { emitEvent: false });
            }
            else {
                this.control.setValue(typeof value === 'string' ? fromIsoDate(value) : null, { emitEvent: false });
            }
        });
        this.control.valueChanges.pipe(takeUntilDestroyed(destroyRef)).subscribe(date => {
            this.valueChange.emit(toIsoDate(date));
        });
        this.rangeControl.valueChanges.pipe(takeUntilDestroyed(destroyRef)).subscribe(({ start, end }) => {
            this.valueChange.emit({ start: toIsoDate(start), end: toIsoDate(end) });
        });
    }
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "20.3.33", ngImport: i0, type: DateFieldComponent, deps: [], target: i0.ɵɵFactoryTarget.Component });
    static ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "17.0.0", version: "20.3.33", type: DateFieldComponent, isStandalone: true, selector: "ds-date-field", inputs: { label: { classPropertyName: "label", publicName: "label", isSignal: true, isRequired: true, transformFunction: null }, primitive: { classPropertyName: "primitive", publicName: "primitive", isSignal: true, isRequired: true, transformFunction: null }, value: { classPropertyName: "value", publicName: "value", isSignal: true, isRequired: false, transformFunction: null }, errors: { classPropertyName: "errors", publicName: "errors", isSignal: true, isRequired: false, transformFunction: null } }, outputs: { valueChange: "valueChange" }, providers: [
            provideDateFnsFieldAdapter(),
            {
                provide: MAT_DATE_FORMATS,
                useFactory: () => {
                    const host = inject(DateFieldComponent);
                    return dateFormatsFrom(() => host.pattern());
                }
            }
        ], ngImport: i0, template: `
    @if (range()) {
      <mat-form-field appearance="outline" class="ds-field">
        <mat-label>{{ label() }}</mat-label>
        <mat-date-range-input [formGroup]="rangeControl" [rangePicker]="rangePicker">
          <input matStartDate formControlName="start" [placeholder]="startPlaceholder()" />
          <input matEndDate formControlName="end" [placeholder]="endPlaceholder()" />
        </mat-date-range-input>
        <mat-datepicker-toggle matSuffix [for]="rangePicker" />
        <mat-date-range-picker #rangePicker />
        @if (primitive().hint ?? primitive().description; as hint) {
          <mat-hint>{{ hint }}</mat-hint>
        }
        @for (message of errors(); track message) {
          <mat-error>{{ message }}</mat-error>
        }
      </mat-form-field>
    } @else {
      <mat-form-field appearance="outline" class="ds-field">
        <mat-label>{{ label() }}</mat-label>
        <input matInput [formControl]="control" [matDatepicker]="picker" [placeholder]="pattern().toLowerCase()" />
        <mat-datepicker-toggle matSuffix [for]="picker" />
        <mat-datepicker #picker />
        @if (primitive().hint ?? primitive().description; as hint) {
          <mat-hint>{{ hint }}</mat-hint>
        }
        @for (message of errors(); track message) {
          <mat-error>{{ message }}</mat-error>
        }
      </mat-form-field>
    }
  `, isInline: true, dependencies: [{ kind: "ngmodule", type: ReactiveFormsModule }, { kind: "directive", type: i1$3.DefaultValueAccessor, selector: "input:not([type=checkbox])[formControlName],textarea[formControlName],input:not([type=checkbox])[formControl],textarea[formControl],input:not([type=checkbox])[ngModel],textarea[ngModel],[ngDefaultControl]" }, { kind: "directive", type: i1$3.NgControlStatus, selector: "[formControlName],[ngModel],[formControl]" }, { kind: "directive", type: i1$3.NgControlStatusGroup, selector: "[formGroupName],[formArrayName],[ngModelGroup],[formGroup],form:not([ngNoForm]),[ngForm]" }, { kind: "directive", type: i1$3.FormControlDirective, selector: "[formControl]", inputs: ["formControl", "disabled", "ngModel"], outputs: ["ngModelChange"], exportAs: ["ngForm"] }, { kind: "directive", type: i1$3.FormGroupDirective, selector: "[formGroup]", inputs: ["formGroup"], outputs: ["ngSubmit"], exportAs: ["ngForm"] }, { kind: "directive", type: i1$3.FormControlName, selector: "[formControlName]", inputs: ["formControlName", "disabled", "ngModel"], outputs: ["ngModelChange"] }, { kind: "ngmodule", type: MatFormFieldModule }, { kind: "component", type: i1.MatFormField, selector: "mat-form-field", inputs: ["hideRequiredMarker", "color", "floatLabel", "appearance", "subscriptSizing", "hintLabel"], exportAs: ["matFormField"] }, { kind: "directive", type: i1.MatLabel, selector: "mat-label" }, { kind: "directive", type: i1.MatHint, selector: "mat-hint", inputs: ["align", "id"] }, { kind: "directive", type: i1.MatError, selector: "mat-error, [matError]", inputs: ["id"] }, { kind: "directive", type: i1.MatSuffix, selector: "[matSuffix], [matIconSuffix], [matTextSuffix]", inputs: ["matTextSuffix"] }, { kind: "ngmodule", type: MatInputModule }, { kind: "directive", type: i2.MatInput, selector: "input[matInput], textarea[matInput], select[matNativeControl],      input[matNativeControl], textarea[matNativeControl]", inputs: ["disabled", "id", "placeholder", "name", "required", "type", "errorStateMatcher", "aria-describedby", "value", "readonly", "disabledInteractive"], exportAs: ["matInput"] }, { kind: "ngmodule", type: MatDatepickerModule }, { kind: "component", type: i4.MatDatepicker, selector: "mat-datepicker", exportAs: ["matDatepicker"] }, { kind: "directive", type: i4.MatDatepickerInput, selector: "input[matDatepicker]", inputs: ["matDatepicker", "min", "max", "matDatepickerFilter"], exportAs: ["matDatepickerInput"] }, { kind: "component", type: i4.MatDatepickerToggle, selector: "mat-datepicker-toggle", inputs: ["for", "tabIndex", "aria-label", "disabled", "disableRipple"], exportAs: ["matDatepickerToggle"] }, { kind: "component", type: i4.MatDateRangeInput, selector: "mat-date-range-input", inputs: ["rangePicker", "required", "dateFilter", "min", "max", "disabled", "separator", "comparisonStart", "comparisonEnd"], exportAs: ["matDateRangeInput"] }, { kind: "directive", type: i4.MatStartDate, selector: "input[matStartDate]", outputs: ["dateChange", "dateInput"] }, { kind: "directive", type: i4.MatEndDate, selector: "input[matEndDate]", outputs: ["dateChange", "dateInput"] }, { kind: "component", type: i4.MatDateRangePicker, selector: "mat-date-range-picker", exportAs: ["matDateRangePicker"] }], changeDetection: i0.ChangeDetectionStrategy.OnPush });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "20.3.33", ngImport: i0, type: DateFieldComponent, decorators: [{
            type: Component,
            args: [{
                    selector: 'ds-date-field',
                    standalone: true,
                    imports: [ReactiveFormsModule, MatFormFieldModule, MatInputModule, MatDatepickerModule],
                    changeDetection: ChangeDetectionStrategy.OnPush,
                    providers: [
                        provideDateFnsFieldAdapter(),
                        {
                            provide: MAT_DATE_FORMATS,
                            useFactory: () => {
                                const host = inject(DateFieldComponent);
                                return dateFormatsFrom(() => host.pattern());
                            }
                        }
                    ],
                    template: `
    @if (range()) {
      <mat-form-field appearance="outline" class="ds-field">
        <mat-label>{{ label() }}</mat-label>
        <mat-date-range-input [formGroup]="rangeControl" [rangePicker]="rangePicker">
          <input matStartDate formControlName="start" [placeholder]="startPlaceholder()" />
          <input matEndDate formControlName="end" [placeholder]="endPlaceholder()" />
        </mat-date-range-input>
        <mat-datepicker-toggle matSuffix [for]="rangePicker" />
        <mat-date-range-picker #rangePicker />
        @if (primitive().hint ?? primitive().description; as hint) {
          <mat-hint>{{ hint }}</mat-hint>
        }
        @for (message of errors(); track message) {
          <mat-error>{{ message }}</mat-error>
        }
      </mat-form-field>
    } @else {
      <mat-form-field appearance="outline" class="ds-field">
        <mat-label>{{ label() }}</mat-label>
        <input matInput [formControl]="control" [matDatepicker]="picker" [placeholder]="pattern().toLowerCase()" />
        <mat-datepicker-toggle matSuffix [for]="picker" />
        <mat-datepicker #picker />
        @if (primitive().hint ?? primitive().description; as hint) {
          <mat-hint>{{ hint }}</mat-hint>
        }
        @for (message of errors(); track message) {
          <mat-error>{{ message }}</mat-error>
        }
      </mat-form-field>
    }
  `
                }]
        }], ctorParameters: () => [], propDecorators: { label: [{ type: i0.Input, args: [{ isSignal: true, alias: "label", required: true }] }], primitive: [{ type: i0.Input, args: [{ isSignal: true, alias: "primitive", required: true }] }], value: [{ type: i0.Input, args: [{ isSignal: true, alias: "value", required: false }] }], errors: [{ type: i0.Input, args: [{ isSignal: true, alias: "errors", required: false }] }], valueChange: [{ type: i0.Output, args: ["valueChange"] }] } });
function isRange(value) {
    return typeof value === 'object' && value !== null;
}

class ControlErrorsDirective {
    dsControlErrors = input([], ...(ngDevMode ? [{ debugName: "dsControlErrors" }] : []));
    #control = inject(MatFormFieldControl);
    constructor() {
        effect(() => {
            const hasError = this.dsControlErrors().length > 0;
            if (this.#control.ngControl)
                return;
            this.#control.errorState = hasError;
            this.#control.stateChanges.next();
        });
    }
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "20.3.33", ngImport: i0, type: ControlErrorsDirective, deps: [], target: i0.ɵɵFactoryTarget.Directive });
    static ɵdir = i0.ɵɵngDeclareDirective({ minVersion: "17.1.0", version: "20.3.33", type: ControlErrorsDirective, isStandalone: true, selector: "[dsControlErrors]", inputs: { dsControlErrors: { classPropertyName: "dsControlErrors", publicName: "dsControlErrors", isSignal: true, isRequired: false, transformFunction: null } }, ngImport: i0 });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "20.3.33", ngImport: i0, type: ControlErrorsDirective, decorators: [{
            type: Directive,
            args: [{ selector: '[dsControlErrors]', standalone: true }]
        }], ctorParameters: () => [], propDecorators: { dsControlErrors: [{ type: i0.Input, args: [{ isSignal: true, alias: "dsControlErrors", required: false }] }] } });

class DecimalFieldComponent {
    label = input.required(...(ngDevMode ? [{ debugName: "label" }] : []));
    primitive = input.required(...(ngDevMode ? [{ debugName: "primitive" }] : []));
    value = input(...(ngDevMode ? [undefined, { debugName: "value" }] : []));
    errors = input([], ...(ngDevMode ? [{ debugName: "errors" }] : []));
    valueChange = output();
    onInput(event) {
        const raw = event.target.value;
        if (raw === '') {
            this.valueChange.emit(null);
            return;
        }
        const n = Number(raw);
        if (!Number.isNaN(n))
            this.valueChange.emit(n);
    }
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "20.3.33", ngImport: i0, type: DecimalFieldComponent, deps: [], target: i0.ɵɵFactoryTarget.Component });
    static ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "17.0.0", version: "20.3.33", type: DecimalFieldComponent, isStandalone: true, selector: "ds-decimal-field", inputs: { label: { classPropertyName: "label", publicName: "label", isSignal: true, isRequired: true, transformFunction: null }, primitive: { classPropertyName: "primitive", publicName: "primitive", isSignal: true, isRequired: true, transformFunction: null }, value: { classPropertyName: "value", publicName: "value", isSignal: true, isRequired: false, transformFunction: null }, errors: { classPropertyName: "errors", publicName: "errors", isSignal: true, isRequired: false, transformFunction: null } }, outputs: { valueChange: "valueChange" }, ngImport: i0, template: `
    <mat-form-field appearance="outline" class="ds-field">
      <mat-label>{{ label() }}</mat-label>
      <input
        matInput
        type="number"
        [dsControlErrors]="errors()"
        [value]="value() ?? ''"
        [attr.min]="primitive().min ?? null"
        [attr.max]="primitive().max ?? null"
        [placeholder]="primitive().default?.toString() ?? ''"
        (input)="onInput($event)"
      />
      @if (primitive().hint ?? primitive().description; as hint) {
        <mat-hint>{{ hint }}</mat-hint>
      }
      @for (message of errors(); track message) {
        <mat-error>{{ message }}</mat-error>
      }
    </mat-form-field>
  `, isInline: true, dependencies: [{ kind: "ngmodule", type: MatFormFieldModule }, { kind: "component", type: i1.MatFormField, selector: "mat-form-field", inputs: ["hideRequiredMarker", "color", "floatLabel", "appearance", "subscriptSizing", "hintLabel"], exportAs: ["matFormField"] }, { kind: "directive", type: i1.MatLabel, selector: "mat-label" }, { kind: "directive", type: i1.MatHint, selector: "mat-hint", inputs: ["align", "id"] }, { kind: "directive", type: i1.MatError, selector: "mat-error, [matError]", inputs: ["id"] }, { kind: "ngmodule", type: MatInputModule }, { kind: "directive", type: i2.MatInput, selector: "input[matInput], textarea[matInput], select[matNativeControl],      input[matNativeControl], textarea[matNativeControl]", inputs: ["disabled", "id", "placeholder", "name", "required", "type", "errorStateMatcher", "aria-describedby", "value", "readonly", "disabledInteractive"], exportAs: ["matInput"] }, { kind: "directive", type: ControlErrorsDirective, selector: "[dsControlErrors]", inputs: ["dsControlErrors"] }], changeDetection: i0.ChangeDetectionStrategy.OnPush });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "20.3.33", ngImport: i0, type: DecimalFieldComponent, decorators: [{
            type: Component,
            args: [{
                    selector: 'ds-decimal-field',
                    standalone: true,
                    imports: [MatFormFieldModule, MatInputModule, ControlErrorsDirective],
                    changeDetection: ChangeDetectionStrategy.OnPush,
                    template: `
    <mat-form-field appearance="outline" class="ds-field">
      <mat-label>{{ label() }}</mat-label>
      <input
        matInput
        type="number"
        [dsControlErrors]="errors()"
        [value]="value() ?? ''"
        [attr.min]="primitive().min ?? null"
        [attr.max]="primitive().max ?? null"
        [placeholder]="primitive().default?.toString() ?? ''"
        (input)="onInput($event)"
      />
      @if (primitive().hint ?? primitive().description; as hint) {
        <mat-hint>{{ hint }}</mat-hint>
      }
      @for (message of errors(); track message) {
        <mat-error>{{ message }}</mat-error>
      }
    </mat-form-field>
  `
                }]
        }], propDecorators: { label: [{ type: i0.Input, args: [{ isSignal: true, alias: "label", required: true }] }], primitive: [{ type: i0.Input, args: [{ isSignal: true, alias: "primitive", required: true }] }], value: [{ type: i0.Input, args: [{ isSignal: true, alias: "value", required: false }] }], errors: [{ type: i0.Input, args: [{ isSignal: true, alias: "errors", required: false }] }], valueChange: [{ type: i0.Output, args: ["valueChange"] }] } });

const SEGMENTED_THRESHOLD = 4;
class EnumFieldComponent {
    label = input.required(...(ngDevMode ? [{ debugName: "label" }] : []));
    primitive = input.required(...(ngDevMode ? [{ debugName: "primitive" }] : []));
    value = input(...(ngDevMode ? [undefined, { debugName: "value" }] : []));
    errors = input([], ...(ngDevMode ? [{ debugName: "errors" }] : []));
    valueChange = output();
    effective = computed(() => this.value() ?? this.primitive().default ?? null, ...(ngDevMode ? [{ debugName: "effective" }] : []));
    /** Options paired with a display label — blank values get a visible placeholder so the control isn't empty. */
    optionViews = computed(() => this.primitive().options.map(value => ({ value, label: value.trim() === '' ? '—' : value })), ...(ngDevMode ? [{ debugName: "optionViews" }] : []));
    hint = computed(() => this.primitive().hint ?? this.primitive().description, ...(ngDevMode ? [{ debugName: "hint" }] : []));
    useSegmented = computed(() => this.primitive().options.length <= SEGMENTED_THRESHOLD, ...(ngDevMode ? [{ debugName: "useSegmented" }] : []));
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "20.3.33", ngImport: i0, type: EnumFieldComponent, deps: [], target: i0.ɵɵFactoryTarget.Component });
    static ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "17.0.0", version: "20.3.33", type: EnumFieldComponent, isStandalone: true, selector: "ds-enum-field", inputs: { label: { classPropertyName: "label", publicName: "label", isSignal: true, isRequired: true, transformFunction: null }, primitive: { classPropertyName: "primitive", publicName: "primitive", isSignal: true, isRequired: true, transformFunction: null }, value: { classPropertyName: "value", publicName: "value", isSignal: true, isRequired: false, transformFunction: null }, errors: { classPropertyName: "errors", publicName: "errors", isSignal: true, isRequired: false, transformFunction: null } }, outputs: { valueChange: "valueChange" }, ngImport: i0, template: `
    @if (useSegmented()) {
      <div class="ds-enum-label">{{ label() }}</div>
      <mat-button-toggle-group class="ds-toggle-group" [value]="effective()" (change)="valueChange.emit($event.value)">
        @for (opt of optionViews(); track opt.value) {
          <mat-button-toggle [value]="opt.value">{{ opt.label }}</mat-button-toggle>
        }
      </mat-button-toggle-group>
      @if (errors().length) {
        @for (message of errors(); track message) {
          <div class="ds-error">{{ message }}</div>
        }
      } @else if (hint(); as text) {
        <div class="ds-hint">{{ text }}</div>
      }
    } @else {
      <mat-form-field appearance="outline" class="ds-field">
        <mat-label>{{ label() }}</mat-label>
        <mat-select
          [dsControlErrors]="errors()"
          [value]="effective() ?? ''"
          (selectionChange)="valueChange.emit($event.value)"
        >
          @for (opt of optionViews(); track opt.value) {
            <mat-option [value]="opt.value">{{ opt.label }}</mat-option>
          }
        </mat-select>
        @if (hint(); as text) {
          <mat-hint>{{ text }}</mat-hint>
        }
        @for (message of errors(); track message) {
          <mat-error>{{ message }}</mat-error>
        }
      </mat-form-field>
    }
  `, isInline: true, dependencies: [{ kind: "ngmodule", type: MatButtonToggleModule }, { kind: "directive", type: i1$4.MatButtonToggleGroup, selector: "mat-button-toggle-group", inputs: ["appearance", "name", "vertical", "value", "multiple", "disabled", "disabledInteractive", "hideSingleSelectionIndicator", "hideMultipleSelectionIndicator"], outputs: ["valueChange", "change"], exportAs: ["matButtonToggleGroup"] }, { kind: "component", type: i1$4.MatButtonToggle, selector: "mat-button-toggle", inputs: ["aria-label", "aria-labelledby", "id", "name", "value", "tabIndex", "disableRipple", "appearance", "checked", "disabled", "disabledInteractive"], outputs: ["change"], exportAs: ["matButtonToggle"] }, { kind: "ngmodule", type: MatFormFieldModule }, { kind: "component", type: i1.MatFormField, selector: "mat-form-field", inputs: ["hideRequiredMarker", "color", "floatLabel", "appearance", "subscriptSizing", "hintLabel"], exportAs: ["matFormField"] }, { kind: "directive", type: i1.MatLabel, selector: "mat-label" }, { kind: "directive", type: i1.MatHint, selector: "mat-hint", inputs: ["align", "id"] }, { kind: "directive", type: i1.MatError, selector: "mat-error, [matError]", inputs: ["id"] }, { kind: "ngmodule", type: MatSelectModule }, { kind: "component", type: i3$2.MatSelect, selector: "mat-select", inputs: ["aria-describedby", "panelClass", "disabled", "disableRipple", "tabIndex", "hideSingleSelectionIndicator", "placeholder", "required", "multiple", "disableOptionCentering", "compareWith", "value", "aria-label", "aria-labelledby", "errorStateMatcher", "typeaheadDebounceInterval", "sortComparator", "id", "panelWidth", "canSelectNullableOptions"], outputs: ["openedChange", "opened", "closed", "selectionChange", "valueChange"], exportAs: ["matSelect"] }, { kind: "component", type: i3$2.MatOption, selector: "mat-option", inputs: ["value", "id", "disabled"], outputs: ["onSelectionChange"], exportAs: ["matOption"] }, { kind: "directive", type: ControlErrorsDirective, selector: "[dsControlErrors]", inputs: ["dsControlErrors"] }], changeDetection: i0.ChangeDetectionStrategy.OnPush });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "20.3.33", ngImport: i0, type: EnumFieldComponent, decorators: [{
            type: Component,
            args: [{
                    selector: 'ds-enum-field',
                    standalone: true,
                    imports: [MatButtonToggleModule, MatFormFieldModule, MatSelectModule, ControlErrorsDirective],
                    changeDetection: ChangeDetectionStrategy.OnPush,
                    template: `
    @if (useSegmented()) {
      <div class="ds-enum-label">{{ label() }}</div>
      <mat-button-toggle-group class="ds-toggle-group" [value]="effective()" (change)="valueChange.emit($event.value)">
        @for (opt of optionViews(); track opt.value) {
          <mat-button-toggle [value]="opt.value">{{ opt.label }}</mat-button-toggle>
        }
      </mat-button-toggle-group>
      @if (errors().length) {
        @for (message of errors(); track message) {
          <div class="ds-error">{{ message }}</div>
        }
      } @else if (hint(); as text) {
        <div class="ds-hint">{{ text }}</div>
      }
    } @else {
      <mat-form-field appearance="outline" class="ds-field">
        <mat-label>{{ label() }}</mat-label>
        <mat-select
          [dsControlErrors]="errors()"
          [value]="effective() ?? ''"
          (selectionChange)="valueChange.emit($event.value)"
        >
          @for (opt of optionViews(); track opt.value) {
            <mat-option [value]="opt.value">{{ opt.label }}</mat-option>
          }
        </mat-select>
        @if (hint(); as text) {
          <mat-hint>{{ text }}</mat-hint>
        }
        @for (message of errors(); track message) {
          <mat-error>{{ message }}</mat-error>
        }
      </mat-form-field>
    }
  `
                }]
        }], propDecorators: { label: [{ type: i0.Input, args: [{ isSignal: true, alias: "label", required: true }] }], primitive: [{ type: i0.Input, args: [{ isSignal: true, alias: "primitive", required: true }] }], value: [{ type: i0.Input, args: [{ isSignal: true, alias: "value", required: false }] }], errors: [{ type: i0.Input, args: [{ isSignal: true, alias: "errors", required: false }] }], valueChange: [{ type: i0.Output, args: ["valueChange"] }] } });

class SelectFieldComponent {
    label = input.required(...(ngDevMode ? [{ debugName: "label" }] : []));
    primitive = input.required(...(ngDevMode ? [{ debugName: "primitive" }] : []));
    value = input(...(ngDevMode ? [undefined, { debugName: "value" }] : []));
    errors = input([], ...(ngDevMode ? [{ debugName: "errors" }] : []));
    valueChange = output();
    multiple = computed(() => this.primitive().multiple === true, ...(ngDevMode ? [{ debugName: "multiple" }] : []));
    values = computed(() => {
        return [this.value() || []].flat();
    }, ...(ngDevMode ? [{ debugName: "values" }] : []));
    singleValue = computed(() => {
        return [this.value()].flat()[0] ?? '';
    }, ...(ngDevMode ? [{ debugName: "singleValue" }] : []));
    defaultText() {
        const def = this.primitive().default;
        return Array.isArray(def) ? def.join(', ') : (def ?? '');
    }
    onSingleInput(event) {
        this.valueChange.emit(event.target.value);
    }
    addToken(event) {
        const raw = event.value.trim();
        if (!raw)
            return;
        this.valueChange.emit([...this.values(), raw]);
        event.chipInput.clear();
    }
    removeAt(index) {
        this.valueChange.emit(this.values().filter((_, i) => i !== index));
    }
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "20.3.33", ngImport: i0, type: SelectFieldComponent, deps: [], target: i0.ɵɵFactoryTarget.Component });
    static ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "17.0.0", version: "20.3.33", type: SelectFieldComponent, isStandalone: true, selector: "ds-select-field", inputs: { label: { classPropertyName: "label", publicName: "label", isSignal: true, isRequired: true, transformFunction: null }, primitive: { classPropertyName: "primitive", publicName: "primitive", isSignal: true, isRequired: true, transformFunction: null }, value: { classPropertyName: "value", publicName: "value", isSignal: true, isRequired: false, transformFunction: null }, errors: { classPropertyName: "errors", publicName: "errors", isSignal: true, isRequired: false, transformFunction: null } }, outputs: { valueChange: "valueChange" }, ngImport: i0, template: `
    @if (multiple()) {
      <mat-form-field appearance="outline" class="ds-field" subscriptSizing="dynamic">
        <mat-label>{{ label() }}</mat-label>
        <mat-chip-grid #chipGrid [dsControlErrors]="errors()">
          @for (val of values(); track val; let i = $index) {
            <mat-chip-row (removed)="removeAt(i)">
              {{ val }}
              <button matChipRemove>
                <mat-icon>cancel</mat-icon>
              </button>
            </mat-chip-row>
          }
        </mat-chip-grid>
        <input
          [matChipInputFor]="chipGrid"
          [matChipInputAddOnBlur]="true"
          (matChipInputTokenEnd)="addToken($event)"
          placeholder="Add value…"
        />
        <mat-hint>{{ primitive().hint ?? primitive().description ?? 'Press Enter or comma to add' }}</mat-hint>
        @for (message of errors(); track message) {
          <mat-error>{{ message }}</mat-error>
        }
      </mat-form-field>
    } @else {
      <mat-form-field appearance="outline" class="ds-field" subscriptSizing="dynamic">
        <mat-label>{{ label() }}</mat-label>
        <input
          matInput
          type="text"
          [dsControlErrors]="errors()"
          [value]="singleValue()"
          [placeholder]="defaultText()"
          (input)="onSingleInput($event)"
        />
        @if (primitive().hint ?? primitive().description; as hint) {
          <mat-hint>{{ hint }}</mat-hint>
        }
        @for (message of errors(); track message) {
          <mat-error>{{ message }}</mat-error>
        }
      </mat-form-field>
    }
  `, isInline: true, styles: [":host{display:block;width:100%}.ds-field{width:100%}\n"], dependencies: [{ kind: "ngmodule", type: MatFormFieldModule }, { kind: "component", type: i1.MatFormField, selector: "mat-form-field", inputs: ["hideRequiredMarker", "color", "floatLabel", "appearance", "subscriptSizing", "hintLabel"], exportAs: ["matFormField"] }, { kind: "directive", type: i1.MatLabel, selector: "mat-label" }, { kind: "directive", type: i1.MatHint, selector: "mat-hint", inputs: ["align", "id"] }, { kind: "directive", type: i1.MatError, selector: "mat-error, [matError]", inputs: ["id"] }, { kind: "ngmodule", type: MatInputModule }, { kind: "directive", type: i2.MatInput, selector: "input[matInput], textarea[matInput], select[matNativeControl],      input[matNativeControl], textarea[matNativeControl]", inputs: ["disabled", "id", "placeholder", "name", "required", "type", "errorStateMatcher", "aria-describedby", "value", "readonly", "disabledInteractive"], exportAs: ["matInput"] }, { kind: "ngmodule", type: MatChipsModule }, { kind: "component", type: i3$3.MatChipGrid, selector: "mat-chip-grid", inputs: ["disabled", "placeholder", "required", "value", "errorStateMatcher"], outputs: ["change", "valueChange"] }, { kind: "directive", type: i3$3.MatChipInput, selector: "input[matChipInputFor]", inputs: ["matChipInputFor", "matChipInputAddOnBlur", "matChipInputSeparatorKeyCodes", "placeholder", "id", "disabled", "readonly", "matChipInputDisabledInteractive"], outputs: ["matChipInputTokenEnd"], exportAs: ["matChipInput", "matChipInputFor"] }, { kind: "directive", type: i3$3.MatChipRemove, selector: "[matChipRemove]" }, { kind: "component", type: i3$3.MatChipRow, selector: "mat-chip-row, [mat-chip-row], mat-basic-chip-row, [mat-basic-chip-row]", inputs: ["editable"], outputs: ["edited"] }, { kind: "ngmodule", type: MatIconModule }, { kind: "component", type: i3.MatIcon, selector: "mat-icon", inputs: ["color", "inline", "svgIcon", "fontSet", "fontIcon"], exportAs: ["matIcon"] }, { kind: "directive", type: ControlErrorsDirective, selector: "[dsControlErrors]", inputs: ["dsControlErrors"] }], changeDetection: i0.ChangeDetectionStrategy.OnPush });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "20.3.33", ngImport: i0, type: SelectFieldComponent, decorators: [{
            type: Component,
            args: [{ selector: 'ds-select-field', standalone: true, imports: [MatFormFieldModule, MatInputModule, MatChipsModule, MatIconModule, ControlErrorsDirective], changeDetection: ChangeDetectionStrategy.OnPush, template: `
    @if (multiple()) {
      <mat-form-field appearance="outline" class="ds-field" subscriptSizing="dynamic">
        <mat-label>{{ label() }}</mat-label>
        <mat-chip-grid #chipGrid [dsControlErrors]="errors()">
          @for (val of values(); track val; let i = $index) {
            <mat-chip-row (removed)="removeAt(i)">
              {{ val }}
              <button matChipRemove>
                <mat-icon>cancel</mat-icon>
              </button>
            </mat-chip-row>
          }
        </mat-chip-grid>
        <input
          [matChipInputFor]="chipGrid"
          [matChipInputAddOnBlur]="true"
          (matChipInputTokenEnd)="addToken($event)"
          placeholder="Add value…"
        />
        <mat-hint>{{ primitive().hint ?? primitive().description ?? 'Press Enter or comma to add' }}</mat-hint>
        @for (message of errors(); track message) {
          <mat-error>{{ message }}</mat-error>
        }
      </mat-form-field>
    } @else {
      <mat-form-field appearance="outline" class="ds-field" subscriptSizing="dynamic">
        <mat-label>{{ label() }}</mat-label>
        <input
          matInput
          type="text"
          [dsControlErrors]="errors()"
          [value]="singleValue()"
          [placeholder]="defaultText()"
          (input)="onSingleInput($event)"
        />
        @if (primitive().hint ?? primitive().description; as hint) {
          <mat-hint>{{ hint }}</mat-hint>
        }
        @for (message of errors(); track message) {
          <mat-error>{{ message }}</mat-error>
        }
      </mat-form-field>
    }
  `, styles: [":host{display:block;width:100%}.ds-field{width:100%}\n"] }]
        }], propDecorators: { label: [{ type: i0.Input, args: [{ isSignal: true, alias: "label", required: true }] }], primitive: [{ type: i0.Input, args: [{ isSignal: true, alias: "primitive", required: true }] }], value: [{ type: i0.Input, args: [{ isSignal: true, alias: "value", required: false }] }], errors: [{ type: i0.Input, args: [{ isSignal: true, alias: "errors", required: false }] }], valueChange: [{ type: i0.Output, args: ["valueChange"] }] } });

class TextFieldComponent {
    label = input.required(...(ngDevMode ? [{ debugName: "label" }] : []));
    primitive = input.required(...(ngDevMode ? [{ debugName: "primitive" }] : []));
    value = input(...(ngDevMode ? [undefined, { debugName: "value" }] : []));
    errors = input([], ...(ngDevMode ? [{ debugName: "errors" }] : []));
    valueChange = output();
    onInput(event) {
        this.valueChange.emit(event.target.value);
    }
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "20.3.33", ngImport: i0, type: TextFieldComponent, deps: [], target: i0.ɵɵFactoryTarget.Component });
    static ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "17.0.0", version: "20.3.33", type: TextFieldComponent, isStandalone: true, selector: "ds-text-field", inputs: { label: { classPropertyName: "label", publicName: "label", isSignal: true, isRequired: true, transformFunction: null }, primitive: { classPropertyName: "primitive", publicName: "primitive", isSignal: true, isRequired: true, transformFunction: null }, value: { classPropertyName: "value", publicName: "value", isSignal: true, isRequired: false, transformFunction: null }, errors: { classPropertyName: "errors", publicName: "errors", isSignal: true, isRequired: false, transformFunction: null } }, outputs: { valueChange: "valueChange" }, ngImport: i0, template: `
    <mat-form-field appearance="outline" class="ds-field">
      <mat-label>{{ label() }}</mat-label>
      <input
        matInput
        type="text"
        [dsControlErrors]="errors()"
        [value]="value() ?? ''"
        [placeholder]="primitive().default ?? ''"
        (input)="onInput($event)"
      />
      @if (primitive().hint ?? primitive().description; as hint) {
        <mat-hint>{{ hint }}</mat-hint>
      }
      @for (message of errors(); track message) {
        <mat-error>{{ message }}</mat-error>
      }
    </mat-form-field>
  `, isInline: true, dependencies: [{ kind: "ngmodule", type: MatFormFieldModule }, { kind: "component", type: i1.MatFormField, selector: "mat-form-field", inputs: ["hideRequiredMarker", "color", "floatLabel", "appearance", "subscriptSizing", "hintLabel"], exportAs: ["matFormField"] }, { kind: "directive", type: i1.MatLabel, selector: "mat-label" }, { kind: "directive", type: i1.MatHint, selector: "mat-hint", inputs: ["align", "id"] }, { kind: "directive", type: i1.MatError, selector: "mat-error, [matError]", inputs: ["id"] }, { kind: "ngmodule", type: MatInputModule }, { kind: "directive", type: i2.MatInput, selector: "input[matInput], textarea[matInput], select[matNativeControl],      input[matNativeControl], textarea[matNativeControl]", inputs: ["disabled", "id", "placeholder", "name", "required", "type", "errorStateMatcher", "aria-describedby", "value", "readonly", "disabledInteractive"], exportAs: ["matInput"] }, { kind: "directive", type: ControlErrorsDirective, selector: "[dsControlErrors]", inputs: ["dsControlErrors"] }], changeDetection: i0.ChangeDetectionStrategy.OnPush });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "20.3.33", ngImport: i0, type: TextFieldComponent, decorators: [{
            type: Component,
            args: [{
                    selector: 'ds-text-field',
                    standalone: true,
                    imports: [MatFormFieldModule, MatInputModule, ControlErrorsDirective],
                    changeDetection: ChangeDetectionStrategy.OnPush,
                    template: `
    <mat-form-field appearance="outline" class="ds-field">
      <mat-label>{{ label() }}</mat-label>
      <input
        matInput
        type="text"
        [dsControlErrors]="errors()"
        [value]="value() ?? ''"
        [placeholder]="primitive().default ?? ''"
        (input)="onInput($event)"
      />
      @if (primitive().hint ?? primitive().description; as hint) {
        <mat-hint>{{ hint }}</mat-hint>
      }
      @for (message of errors(); track message) {
        <mat-error>{{ message }}</mat-error>
      }
    </mat-form-field>
  `
                }]
        }], propDecorators: { label: [{ type: i0.Input, args: [{ isSignal: true, alias: "label", required: true }] }], primitive: [{ type: i0.Input, args: [{ isSignal: true, alias: "primitive", required: true }] }], value: [{ type: i0.Input, args: [{ isSignal: true, alias: "value", required: false }] }], errors: [{ type: i0.Input, args: [{ isSignal: true, alias: "errors", required: false }] }], valueChange: [{ type: i0.Output, args: ["valueChange"] }] } });

class TimeFieldComponent {
    label = input.required(...(ngDevMode ? [{ debugName: "label" }] : []));
    primitive = input.required(...(ngDevMode ? [{ debugName: "primitive" }] : []));
    value = input(...(ngDevMode ? [undefined, { debugName: "value" }] : []));
    errors = input([], ...(ngDevMode ? [{ debugName: "errors" }] : []));
    valueChange = output();
    control = new FormControl(null);
    constructor() {
        effect(() => {
            this.control.setValue(fromIsoTime(this.value() ?? this.primitive().default), { emitEvent: false });
        });
        this.control.valueChanges.pipe(takeUntilDestroyed(inject(DestroyRef))).subscribe(time => {
            this.valueChange.emit(toIsoTime(time));
        });
    }
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "20.3.33", ngImport: i0, type: TimeFieldComponent, deps: [], target: i0.ɵɵFactoryTarget.Component });
    static ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "17.0.0", version: "20.3.33", type: TimeFieldComponent, isStandalone: true, selector: "ds-time-field", inputs: { label: { classPropertyName: "label", publicName: "label", isSignal: true, isRequired: true, transformFunction: null }, primitive: { classPropertyName: "primitive", publicName: "primitive", isSignal: true, isRequired: true, transformFunction: null }, value: { classPropertyName: "value", publicName: "value", isSignal: true, isRequired: false, transformFunction: null }, errors: { classPropertyName: "errors", publicName: "errors", isSignal: true, isRequired: false, transformFunction: null } }, outputs: { valueChange: "valueChange" }, providers: [provideDateFnsFieldAdapter()], ngImport: i0, template: `
    <mat-form-field appearance="outline" class="ds-field">
      <mat-label>{{ label() }}</mat-label>
      <input matInput [formControl]="control" [matTimepicker]="picker" />
      <mat-timepicker-toggle matSuffix [for]="picker" />
      <mat-timepicker #picker />
      @if (primitive().hint ?? primitive().description; as hint) {
        <mat-hint>{{ hint }}</mat-hint>
      }
      @for (message of errors(); track message) {
        <mat-error>{{ message }}</mat-error>
      }
    </mat-form-field>
  `, isInline: true, dependencies: [{ kind: "ngmodule", type: ReactiveFormsModule }, { kind: "directive", type: i1$3.DefaultValueAccessor, selector: "input:not([type=checkbox])[formControlName],textarea[formControlName],input:not([type=checkbox])[formControl],textarea[formControl],input:not([type=checkbox])[ngModel],textarea[ngModel],[ngDefaultControl]" }, { kind: "directive", type: i1$3.NgControlStatus, selector: "[formControlName],[ngModel],[formControl]" }, { kind: "directive", type: i1$3.FormControlDirective, selector: "[formControl]", inputs: ["formControl", "disabled", "ngModel"], outputs: ["ngModelChange"], exportAs: ["ngForm"] }, { kind: "ngmodule", type: MatFormFieldModule }, { kind: "component", type: i1.MatFormField, selector: "mat-form-field", inputs: ["hideRequiredMarker", "color", "floatLabel", "appearance", "subscriptSizing", "hintLabel"], exportAs: ["matFormField"] }, { kind: "directive", type: i1.MatLabel, selector: "mat-label" }, { kind: "directive", type: i1.MatHint, selector: "mat-hint", inputs: ["align", "id"] }, { kind: "directive", type: i1.MatError, selector: "mat-error, [matError]", inputs: ["id"] }, { kind: "directive", type: i1.MatSuffix, selector: "[matSuffix], [matIconSuffix], [matTextSuffix]", inputs: ["matTextSuffix"] }, { kind: "ngmodule", type: MatInputModule }, { kind: "directive", type: i2.MatInput, selector: "input[matInput], textarea[matInput], select[matNativeControl],      input[matNativeControl], textarea[matNativeControl]", inputs: ["disabled", "id", "placeholder", "name", "required", "type", "errorStateMatcher", "aria-describedby", "value", "readonly", "disabledInteractive"], exportAs: ["matInput"] }, { kind: "ngmodule", type: MatTimepickerModule }, { kind: "component", type: i4$1.MatTimepicker, selector: "mat-timepicker", inputs: ["interval", "options", "disableRipple", "aria-label", "aria-labelledby"], outputs: ["selected", "opened", "closed"], exportAs: ["matTimepicker"] }, { kind: "directive", type: i4$1.MatTimepickerInput, selector: "input[matTimepicker]", inputs: ["value", "matTimepicker", "matTimepickerMin", "matTimepickerMax", "matTimepickerOpenOnClick", "disabled"], outputs: ["valueChange"], exportAs: ["matTimepickerInput"] }, { kind: "component", type: i4$1.MatTimepickerToggle, selector: "mat-timepicker-toggle", inputs: ["for", "aria-label", "aria-labelledby", "disabled", "tabIndex", "disableRipple"], exportAs: ["matTimepickerToggle"] }], changeDetection: i0.ChangeDetectionStrategy.OnPush });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "20.3.33", ngImport: i0, type: TimeFieldComponent, decorators: [{
            type: Component,
            args: [{
                    selector: 'ds-time-field',
                    standalone: true,
                    imports: [ReactiveFormsModule, MatFormFieldModule, MatInputModule, MatTimepickerModule],
                    changeDetection: ChangeDetectionStrategy.OnPush,
                    providers: [provideDateFnsFieldAdapter()],
                    template: `
    <mat-form-field appearance="outline" class="ds-field">
      <mat-label>{{ label() }}</mat-label>
      <input matInput [formControl]="control" [matTimepicker]="picker" />
      <mat-timepicker-toggle matSuffix [for]="picker" />
      <mat-timepicker #picker />
      @if (primitive().hint ?? primitive().description; as hint) {
        <mat-hint>{{ hint }}</mat-hint>
      }
      @for (message of errors(); track message) {
        <mat-error>{{ message }}</mat-error>
      }
    </mat-form-field>
  `
                }]
        }], ctorParameters: () => [], propDecorators: { label: [{ type: i0.Input, args: [{ isSignal: true, alias: "label", required: true }] }], primitive: [{ type: i0.Input, args: [{ isSignal: true, alias: "primitive", required: true }] }], value: [{ type: i0.Input, args: [{ isSignal: true, alias: "value", required: false }] }], errors: [{ type: i0.Input, args: [{ isSignal: true, alias: "errors", required: false }] }], valueChange: [{ type: i0.Output, args: ["valueChange"] }] } });

class FieldHostComponent {
    primitive = input.required(...(ngDevMode ? [{ debugName: "primitive" }] : []));
    value = input(...(ngDevMode ? [undefined, { debugName: "value" }] : []));
    label = input.required(...(ngDevMode ? [{ debugName: "label" }] : []));
    path = input.required(...(ngDevMode ? [{ debugName: "path" }] : []));
    errors = input([], ...(ngDevMode ? [{ debugName: "errors" }] : []));
    messages = computed(() => {
        const path = this.path();
        return this.errors()
            .filter(error => error.path.length === path.length && error.path.every((key, i) => key === path[i]))
            .flatMap(error => error.messages);
    }, ...(ngDevMode ? [{ debugName: "messages" }] : []));
    isErrorState() {
        return this.messages().length > 0;
    }
    changed = output();
    groupEntries = computed(() => {
        return listify(this.primitive().shape, (key, primitive) => ({
            key,
            primitive,
            label: Studio.humanize(key)
        }));
    }, ...(ngDevMode ? [{ debugName: "groupEntries" }] : []));
    emit(value) {
        this.changed.emit({ path: this.path(), value });
    }
    groupValueOf(key) {
        return this.value()?.[key];
    }
    childPath(key) {
        return [...this.path(), key];
    }
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "20.3.33", ngImport: i0, type: FieldHostComponent, deps: [], target: i0.ɵɵFactoryTarget.Component });
    static ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "17.0.0", version: "20.3.33", type: FieldHostComponent, isStandalone: true, selector: "ds-field-host", inputs: { primitive: { classPropertyName: "primitive", publicName: "primitive", isSignal: true, isRequired: true, transformFunction: null }, value: { classPropertyName: "value", publicName: "value", isSignal: true, isRequired: false, transformFunction: null }, label: { classPropertyName: "label", publicName: "label", isSignal: true, isRequired: true, transformFunction: null }, path: { classPropertyName: "path", publicName: "path", isSignal: true, isRequired: true, transformFunction: null }, errors: { classPropertyName: "errors", publicName: "errors", isSignal: true, isRequired: false, transformFunction: null } }, outputs: { changed: "changed" }, providers: [{ provide: ErrorStateMatcher, useExisting: forwardRef(() => FieldHostComponent) }], ngImport: i0, template: `
    @switch (primitive().kind) {
      @case ('text') {
        <ds-text-field
          [label]="label()"
          [primitive]="$any(primitive())"
          [value]="$any(value())"
          [errors]="messages()"
          (valueChange)="emit($event)"
        />
      }
      @case ('decimal') {
        <ds-decimal-field
          [label]="label()"
          [primitive]="$any(primitive())"
          [value]="$any(value())"
          [errors]="messages()"
          (valueChange)="emit($event)"
        />
      }
      @case ('checkbox') {
        <ds-checkbox-field
          [label]="label()"
          [primitive]="$any(primitive())"
          [value]="$any(value())"
          [errors]="messages()"
          (valueChange)="emit($event)"
        />
      }
      @case ('enum') {
        <ds-enum-field
          [label]="label()"
          [primitive]="$any(primitive())"
          [value]="$any(value())"
          [errors]="messages()"
          (valueChange)="emit($event)"
        />
      }
      @case ('select') {
        <ds-select-field
          [label]="label()"
          [primitive]="$any(primitive())"
          [value]="$any(value())"
          [errors]="messages()"
          (valueChange)="emit($event)"
        />
      }
      @case ('code') {
        <ds-code-field
          [label]="label()"
          [primitive]="$any(primitive())"
          [value]="$any(value())"
          [errors]="messages()"
          (valueChange)="emit($event)"
        />
      }
      @case ('time') {
        <ds-time-field
          [label]="label()"
          [primitive]="$any(primitive())"
          [value]="$any(value())"
          [errors]="messages()"
          (valueChange)="emit($event)"
        />
      }
      @case ('date') {
        <ds-date-field
          [label]="label()"
          [primitive]="$any(primitive())"
          [value]="$any(value())"
          [errors]="messages()"
          (valueChange)="emit($event)"
        />
      }
      @case ('group') {
        <fieldset class="group">
          <legend class="group__legend">{{ label() }}</legend>
          <div class="group__body">
            @for (entry of groupEntries(); track entry.key) {
              <ds-field-host
                [primitive]="entry.primitive"
                [value]="groupValueOf(entry.key)"
                [label]="entry.label"
                [path]="childPath(entry.key)"
                [errors]="errors()"
                (changed)="changed.emit($event)"
              />
            }
          </div>
        </fieldset>
      }
      @default {
        <div class="field field--unknown">Unsupported primitive: {{ primitive().kind }}</div>
      }
    }
  `, isInline: true, dependencies: [{ kind: "component", type: FieldHostComponent, selector: "ds-field-host", inputs: ["primitive", "value", "label", "path", "errors"], outputs: ["changed"] }, { kind: "component", type: TextFieldComponent, selector: "ds-text-field", inputs: ["label", "primitive", "value", "errors"], outputs: ["valueChange"] }, { kind: "component", type: DecimalFieldComponent, selector: "ds-decimal-field", inputs: ["label", "primitive", "value", "errors"], outputs: ["valueChange"] }, { kind: "component", type: CheckboxFieldComponent, selector: "ds-checkbox-field", inputs: ["label", "primitive", "value", "errors"], outputs: ["valueChange"] }, { kind: "component", type: EnumFieldComponent, selector: "ds-enum-field", inputs: ["label", "primitive", "value", "errors"], outputs: ["valueChange"] }, { kind: "component", type: SelectFieldComponent, selector: "ds-select-field", inputs: ["label", "primitive", "value", "errors"], outputs: ["valueChange"] }, { kind: "component", type: CodeFieldComponent, selector: "ds-code-field", inputs: ["label", "primitive", "value", "errors"], outputs: ["valueChange"] }, { kind: "component", type: TimeFieldComponent, selector: "ds-time-field", inputs: ["label", "primitive", "value", "errors"], outputs: ["valueChange"] }, { kind: "component", type: DateFieldComponent, selector: "ds-date-field", inputs: ["label", "primitive", "value", "errors"], outputs: ["valueChange"] }], changeDetection: i0.ChangeDetectionStrategy.OnPush });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "20.3.33", ngImport: i0, type: FieldHostComponent, decorators: [{
            type: Component,
            args: [{
                    selector: 'ds-field-host',
                    standalone: true,
                    imports: [
                        TextFieldComponent,
                        DecimalFieldComponent,
                        CheckboxFieldComponent,
                        EnumFieldComponent,
                        SelectFieldComponent,
                        CodeFieldComponent,
                        TimeFieldComponent,
                        DateFieldComponent
                    ],
                    changeDetection: ChangeDetectionStrategy.OnPush,
                    providers: [{ provide: ErrorStateMatcher, useExisting: forwardRef(() => FieldHostComponent) }],
                    template: `
    @switch (primitive().kind) {
      @case ('text') {
        <ds-text-field
          [label]="label()"
          [primitive]="$any(primitive())"
          [value]="$any(value())"
          [errors]="messages()"
          (valueChange)="emit($event)"
        />
      }
      @case ('decimal') {
        <ds-decimal-field
          [label]="label()"
          [primitive]="$any(primitive())"
          [value]="$any(value())"
          [errors]="messages()"
          (valueChange)="emit($event)"
        />
      }
      @case ('checkbox') {
        <ds-checkbox-field
          [label]="label()"
          [primitive]="$any(primitive())"
          [value]="$any(value())"
          [errors]="messages()"
          (valueChange)="emit($event)"
        />
      }
      @case ('enum') {
        <ds-enum-field
          [label]="label()"
          [primitive]="$any(primitive())"
          [value]="$any(value())"
          [errors]="messages()"
          (valueChange)="emit($event)"
        />
      }
      @case ('select') {
        <ds-select-field
          [label]="label()"
          [primitive]="$any(primitive())"
          [value]="$any(value())"
          [errors]="messages()"
          (valueChange)="emit($event)"
        />
      }
      @case ('code') {
        <ds-code-field
          [label]="label()"
          [primitive]="$any(primitive())"
          [value]="$any(value())"
          [errors]="messages()"
          (valueChange)="emit($event)"
        />
      }
      @case ('time') {
        <ds-time-field
          [label]="label()"
          [primitive]="$any(primitive())"
          [value]="$any(value())"
          [errors]="messages()"
          (valueChange)="emit($event)"
        />
      }
      @case ('date') {
        <ds-date-field
          [label]="label()"
          [primitive]="$any(primitive())"
          [value]="$any(value())"
          [errors]="messages()"
          (valueChange)="emit($event)"
        />
      }
      @case ('group') {
        <fieldset class="group">
          <legend class="group__legend">{{ label() }}</legend>
          <div class="group__body">
            @for (entry of groupEntries(); track entry.key) {
              <ds-field-host
                [primitive]="entry.primitive"
                [value]="groupValueOf(entry.key)"
                [label]="entry.label"
                [path]="childPath(entry.key)"
                [errors]="errors()"
                (changed)="changed.emit($event)"
              />
            }
          </div>
        </fieldset>
      }
      @default {
        <div class="field field--unknown">Unsupported primitive: {{ primitive().kind }}</div>
      }
    }
  `
                }]
        }], propDecorators: { primitive: [{ type: i0.Input, args: [{ isSignal: true, alias: "primitive", required: true }] }], value: [{ type: i0.Input, args: [{ isSignal: true, alias: "value", required: false }] }], label: [{ type: i0.Input, args: [{ isSignal: true, alias: "label", required: true }] }], path: [{ type: i0.Input, args: [{ isSignal: true, alias: "path", required: true }] }], errors: [{ type: i0.Input, args: [{ isSignal: true, alias: "errors", required: false }] }], changed: [{ type: i0.Output, args: ["changed"] }] } });

class PropsFormComponent {
    definition = input.required(...(ngDevMode ? [{ debugName: "definition" }] : []));
    values = input.required(...(ngDevMode ? [{ debugName: "values" }] : []));
    errors = input([], ...(ngDevMode ? [{ debugName: "errors" }] : []));
    changed = output();
    entries = computed(() => listify(this.definition().props, (key, primitive) => ({
        key,
        primitive,
        label: Studio.humanize(key)
    })), ...(ngDevMode ? [{ debugName: "entries" }] : []));
    valueOf(key) {
        return this.values()[key];
    }
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "20.3.33", ngImport: i0, type: PropsFormComponent, deps: [], target: i0.ɵɵFactoryTarget.Component });
    static ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "17.0.0", version: "20.3.33", type: PropsFormComponent, isStandalone: true, selector: "ds-props-form", inputs: { definition: { classPropertyName: "definition", publicName: "definition", isSignal: true, isRequired: true, transformFunction: null }, values: { classPropertyName: "values", publicName: "values", isSignal: true, isRequired: true, transformFunction: null }, errors: { classPropertyName: "errors", publicName: "errors", isSignal: true, isRequired: false, transformFunction: null } }, outputs: { changed: "changed" }, ngImport: i0, template: `
    @if (entries().length) {
      <div class="form">
        @for (entry of entries(); track entry.key) {
          <ds-field-host
            [primitive]="entry.primitive"
            [value]="valueOf(entry.key)"
            [label]="entry.label"
            [path]="[entry.key]"
            [errors]="errors()"
            (changed)="changed.emit($event)"
          />
        }
      </div>
    } @else {
      <p class="form__empty">This component has no configurable props.</p>
    }
  `, isInline: true, styles: [":host{display:block}.form{display:flex;flex-direction:column;gap:10px}.form__empty{margin:0;padding:12px;font-size:12px;color:var(--ds-text-muted);background:var(--ds-chip-bg);border-radius:var(--ds-radius-sm);text-align:center}:host ::ng-deep .ds-field{width:100%;display:block}:host ::ng-deep .ds-enum-label{display:block;font-size:11px;font-weight:600;letter-spacing:.02em;text-transform:uppercase;color:var(--ds-text-muted);margin-bottom:6px}:host ::ng-deep .ds-toggle-group{display:flex;width:100%;border-radius:var(--ds-radius-sm);overflow:hidden}:host ::ng-deep .ds-toggle-group .mat-button-toggle{flex:1;font-size:12px}:host ::ng-deep .ds-toggle-group .mat-button-toggle-label-content{line-height:32px;padding:0 10px}:host ::ng-deep .ds-hint{margin-top:6px;font-size:12px;line-height:16px;color:var(--ds-text-muted)}:host ::ng-deep .ds-error{margin-top:6px;font-size:12px;line-height:16px;color:#ef4444}:host ::ng-deep .ds-field--unknown{padding:8px 10px;font-size:12px;color:var(--ds-text-muted);background:var(--ds-chip-bg);border-radius:var(--ds-radius-sm)}:host ::ng-deep .group{margin:10px 0 0;padding:14px 14px 16px;border:1px solid var(--ds-border);border-radius:var(--ds-radius-sm);background:var(--ds-card-bg-container)}:host ::ng-deep .group__legend{padding:0 6px;font-size:11px;font-weight:700;letter-spacing:.06em;text-transform:uppercase;color:var(--ds-text-muted)}:host ::ng-deep .group__body{display:flex;flex-direction:column;gap:10px;margin-top:4px}\n"], dependencies: [{ kind: "component", type: FieldHostComponent, selector: "ds-field-host", inputs: ["primitive", "value", "label", "path", "errors"], outputs: ["changed"] }], changeDetection: i0.ChangeDetectionStrategy.OnPush });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "20.3.33", ngImport: i0, type: PropsFormComponent, decorators: [{
            type: Component,
            args: [{ selector: 'ds-props-form', standalone: true, imports: [FieldHostComponent], changeDetection: ChangeDetectionStrategy.OnPush, template: `
    @if (entries().length) {
      <div class="form">
        @for (entry of entries(); track entry.key) {
          <ds-field-host
            [primitive]="entry.primitive"
            [value]="valueOf(entry.key)"
            [label]="entry.label"
            [path]="[entry.key]"
            [errors]="errors()"
            (changed)="changed.emit($event)"
          />
        }
      </div>
    } @else {
      <p class="form__empty">This component has no configurable props.</p>
    }
  `, styles: [":host{display:block}.form{display:flex;flex-direction:column;gap:10px}.form__empty{margin:0;padding:12px;font-size:12px;color:var(--ds-text-muted);background:var(--ds-chip-bg);border-radius:var(--ds-radius-sm);text-align:center}:host ::ng-deep .ds-field{width:100%;display:block}:host ::ng-deep .ds-enum-label{display:block;font-size:11px;font-weight:600;letter-spacing:.02em;text-transform:uppercase;color:var(--ds-text-muted);margin-bottom:6px}:host ::ng-deep .ds-toggle-group{display:flex;width:100%;border-radius:var(--ds-radius-sm);overflow:hidden}:host ::ng-deep .ds-toggle-group .mat-button-toggle{flex:1;font-size:12px}:host ::ng-deep .ds-toggle-group .mat-button-toggle-label-content{line-height:32px;padding:0 10px}:host ::ng-deep .ds-hint{margin-top:6px;font-size:12px;line-height:16px;color:var(--ds-text-muted)}:host ::ng-deep .ds-error{margin-top:6px;font-size:12px;line-height:16px;color:#ef4444}:host ::ng-deep .ds-field--unknown{padding:8px 10px;font-size:12px;color:var(--ds-text-muted);background:var(--ds-chip-bg);border-radius:var(--ds-radius-sm)}:host ::ng-deep .group{margin:10px 0 0;padding:14px 14px 16px;border:1px solid var(--ds-border);border-radius:var(--ds-radius-sm);background:var(--ds-card-bg-container)}:host ::ng-deep .group__legend{padding:0 6px;font-size:11px;font-weight:700;letter-spacing:.06em;text-transform:uppercase;color:var(--ds-text-muted)}:host ::ng-deep .group__body{display:flex;flex-direction:column;gap:10px;margin-top:4px}\n"] }]
        }], propDecorators: { definition: [{ type: i0.Input, args: [{ isSignal: true, alias: "definition", required: true }] }], values: [{ type: i0.Input, args: [{ isSignal: true, alias: "values", required: true }] }], errors: [{ type: i0.Input, args: [{ isSignal: true, alias: "errors", required: false }] }], changed: [{ type: i0.Output, args: ["changed"] }] } });

class RelationFieldComponent {
    facade = inject(StudioFacade);
    node = input.required(...(ngDevMode ? [{ debugName: "node" }] : []));
    name = input.required(...(ngDevMode ? [{ debugName: "name" }] : []));
    descriptor = input.required(...(ngDevMode ? [{ debugName: "descriptor" }] : []));
    title = computed(() => Studio.humanize(this.name()), ...(ngDevMode ? [{ debugName: "title" }] : []));
    listPrimitive = { kind: 'select', multiple: true };
    ruleSet = computed(() => this.node().relations[this.name()] ?? { combine: 'and', rules: [], variant: this.descriptor().variant }, ...(ngDevMode ? [{ debugName: "ruleSet" }] : []));
    isCustom = computed(() => this.descriptor().variant === 'custom', ...(ngDevMode ? [{ debugName: "isCustom" }] : []));
    /** The developer-declared fields of a custom relation; empty for the built-in variant. */
    customFields = computed(() => {
        const descriptor = this.descriptor();
        return descriptor.variant === 'custom'
            ? listify(descriptor.props, (key, primitive) => ({ key, primitive, label: Studio.humanize(key) }))
            : [];
    }, ...(ngDevMode ? [{ debugName: "customFields" }] : []));
    operators = computed(() => {
        const descriptor = this.descriptor();
        if (descriptor.variant !== 'builtin')
            return [];
        const all = Object.keys(RELATION_OPERATORS);
        return descriptor.operators ? all.filter(op => descriptor.operators.includes(op)) : all;
    }, ...(ngDevMode ? [{ debugName: "operators" }] : []));
    targets = computed(() => {
        this.facade.root();
        return this.facade.relationTargets(this.node().id, this.descriptor().targetFilter);
    }, ...(ngDevMode ? [{ debugName: "targets" }] : []));
    labelOf(op) {
        return RELATION_OPERATORS[op].label;
    }
    valueShape(op) {
        return op ? RELATION_OPERATORS[op].value : 'none';
    }
    asText(value) {
        return value == null ? '' : String(value);
    }
    ruleProp(rule, key) {
        return rule.props?.[key];
    }
    addCondition() {
        this.facade.startPick(this.targets().map(n => n.id), target => {
            const set = this.ruleSet();
            this.#commit({ ...set, rules: [...set.rules, this.#newRule(target)] });
        });
    }
    /** Seeds a fresh rule for the active variant: custom rules materialize their declared props. */
    #newRule(target) {
        const descriptor = this.descriptor();
        return descriptor.variant === 'custom'
            ? { target, props: materializeShape(descriptor.props) }
            : { target, operator: this.operators()[0] };
    }
    setRuleProp(index, change) {
        this.#patch(index, rule => ({
            ...rule,
            props: setIn(rule.props ?? {}, change.path, change.value)
        }));
    }
    repick(index) {
        this.facade.startPick(this.targets().map(n => n.id), target => {
            this.#patch(index, rule => ({ ...rule, target }));
        });
    }
    setOperator(index, operator) {
        this.#patch(index, rule => {
            const value = this.valueShape(operator) === this.valueShape(rule.operator) ? rule.value : undefined;
            return { ...rule, operator, value };
        });
    }
    setValue(index, value) {
        this.#patch(index, rule => ({ ...rule, value }));
    }
    removeAt(index) {
        const set = this.ruleSet();
        this.#commit({ ...set, rules: set.rules.filter((_, i) => i !== index) });
    }
    toggleCombine() {
        const set = this.ruleSet();
        this.#commit({ ...set, combine: set.combine === 'and' ? 'or' : 'and' });
    }
    #patch(index, fn) {
        const set = this.ruleSet();
        this.#commit({ ...set, rules: set.rules.map((rule, i) => (i === index ? fn(rule) : rule)) });
    }
    #commit(set) {
        const id = this.node().id;
        if (set.rules.length)
            this.facade.setRelation(id, this.name(), { ...set, variant: this.descriptor().variant });
        else
            this.facade.removeRelation(id, this.name());
    }
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "20.3.33", ngImport: i0, type: RelationFieldComponent, deps: [], target: i0.ɵɵFactoryTarget.Component });
    static ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "17.0.0", version: "20.3.33", type: RelationFieldComponent, isStandalone: true, selector: "ds-relation-field", inputs: { node: { classPropertyName: "node", publicName: "node", isSignal: true, isRequired: true, transformFunction: null }, name: { classPropertyName: "name", publicName: "name", isSignal: true, isRequired: true, transformFunction: null }, descriptor: { classPropertyName: "descriptor", publicName: "descriptor", isSignal: true, isRequired: true, transformFunction: null } }, ngImport: i0, template: `
    <div class="relation">
      <div class="relation__head">
        <span class="relation__name">{{ title() }}</span>
      </div>

      @if (ruleSet().rules.length) {
        <div class="relation__conditions">
          @for (rule of ruleSet().rules; track $index; let ruleIndex = $index) {
            @if (!$first) {
              <button type="button" class="relation__joiner" (click)="toggleCombine()" title="Toggle AND / OR">
                {{ ruleSet().combine }}
              </button>
            }
            <div class="relation__rule">
              <div class="relation__rule-head">
                @let target = facade.describeNode(rule.target);
                <button
                  type="button"
                  class="relation__target"
                  title="Pick another target on canvas"
                  (click)="repick(ruleIndex)"
                  (mouseenter)="facade.highlight([rule.target])"
                  (mouseleave)="facade.clearHighlight()"
                  (focus)="facade.highlight([rule.target])"
                  (blur)="facade.clearHighlight()"
                >
                  <span class="material-icons" aria-hidden="true">ads_click</span>
                  <span class="relation__target-label">
                    {{ target.name }}
                    @if (target.type) {
                      <span class="relation__target-type">{{ target.type }}</span>
                    }
                  </span>
                </button>
                <button type="button" class="relation__remove" (click)="removeAt(ruleIndex); $event.stopPropagation()">
                  <span class="material-icons" aria-hidden="true">close</span>
                </button>
              </div>
              <div class="relation__rule-body">
                @if (isCustom()) {
                  @for (field of customFields(); track field.key) {
                    <ds-field-host
                      [primitive]="field.primitive"
                      [value]="ruleProp(rule, field.key)"
                      [label]="field.label"
                      [path]="[field.key]"
                      (changed)="setRuleProp(ruleIndex, $event)"
                    />
                  }
                } @else {
                  <mat-form-field appearance="outline" class="ds-field relation__op" subscriptSizing="dynamic">
                    <mat-select [value]="rule.operator" (selectionChange)="setOperator(ruleIndex, $event.value)">
                      @for (op of operators(); track op) {
                        <mat-option [value]="op">{{ labelOf(op) }}</mat-option>
                      }
                    </mat-select>
                  </mat-form-field>
                  @switch (valueShape(rule.operator)) {
                    @case ('single') {
                      <mat-form-field appearance="outline" class="ds-field relation__value" subscriptSizing="dynamic">
                        <input
                          matInput
                          [value]="asText(rule.value)"
                          placeholder="Enter a value"
                          (input)="setValue(ruleIndex, $any($event.target).value)"
                        />
                      </mat-form-field>
                    }
                    @case ('list') {
                      <ds-select-field
                        class="relation__value"
                        label="Values"
                        [primitive]="listPrimitive"
                        [value]="$any(rule.value)"
                        (valueChange)="setValue(ruleIndex, $any($event))"
                      />
                    }
                  }
                }
              </div>
            </div>
          }
        </div>
      }

      <button type="button" class="relation__add" [disabled]="!targets().length" (click)="addCondition()">
        <span class="material-icons" aria-hidden="true">add</span>
        {{ ruleSet().rules.length ? 'Add condition' : 'Add a condition' }}
      </button>
    </div>
  `, isInline: true, styles: [".relation{display:flex;flex-direction:column;gap:10px}.relation__head{display:flex;align-items:center}.relation__name{font-weight:600;font-size:.9rem;color:var(--ds-text)}.relation__conditions{display:flex;flex-direction:column;gap:10px;padding-left:12px;border-left:2px solid var(--ds-accent-ring, var(--ds-accent-soft))}.relation__rule{display:flex;flex-direction:column;gap:8px}.relation__rule-head{display:flex;align-items:center;gap:6px}.relation__rule-body{display:flex;flex-direction:column;gap:8px}.relation__target{display:inline-flex;align-items:center;gap:5px;flex:1 1 auto;min-width:0;padding:6px 10px;border:1px solid var(--ds-accent);border-radius:999px;background:var(--ds-accent-soft);color:var(--ds-accent);font-size:.8rem;font-weight:600;cursor:pointer}.relation__target .material-icons{font-size:15px;flex:0 0 auto}.relation__target:hover{filter:brightness(.96)}.relation__target-label{overflow:hidden;white-space:nowrap;text-overflow:ellipsis}.relation__target-type{margin-left:4px;font-weight:500;opacity:.65}.relation__op,.relation__value{display:block;width:100%}.relation__rule-body ::ng-deep .ds-field{display:block;width:100%}.relation__rule-body ::ng-deep .ds-enum-label{display:block;margin-bottom:6px;font-size:11px;font-weight:600;letter-spacing:.02em;text-transform:uppercase;color:var(--ds-text-muted)}.relation__rule-body ::ng-deep .ds-toggle-group{display:flex;width:100%;border-radius:var(--ds-radius-sm);overflow:hidden}.relation__rule-body ::ng-deep .ds-toggle-group .mat-button-toggle{flex:1;font-size:12px}.relation__rule-body ::ng-deep .ds-toggle-group .mat-button-toggle-label-content{line-height:32px;padding:0 10px}.relation__rule-body ::ng-deep .ds-hint{margin-top:6px;font-size:12px;line-height:16px;color:var(--ds-text-muted)}.relation__rule-body ::ng-deep .ds-error{margin-top:6px;font-size:12px;line-height:16px;color:#ef4444}.relation__joiner{align-self:flex-start;padding:2px 12px;border:1px solid var(--ds-accent);border-radius:999px;background:var(--ds-sidebar-bg, var(--ds-card-bg));color:var(--ds-accent);font-size:.7rem;font-weight:700;text-transform:uppercase;letter-spacing:.04em;cursor:pointer}.relation__joiner:hover{background:var(--ds-accent-soft)}.relation__remove{flex:0 0 auto;display:inline-flex;align-items:center;justify-content:center;width:30px;height:30px;border:none;border-radius:8px;background:transparent;color:var(--ds-text-muted);cursor:pointer}.relation__remove .material-icons{font-size:17px}.relation__remove:hover{color:#ef4444;background:#ef44441a}.relation__add{display:inline-flex;align-items:center;gap:6px;align-self:flex-start;padding:6px 10px;border:1px dashed var(--ds-card-border);border-radius:8px;background:transparent;color:var(--ds-accent);font-size:.8rem;font-weight:600;cursor:pointer}.relation__add .material-icons{font-size:16px}.relation__add:hover:not(:disabled){background:var(--ds-accent-soft);border-color:var(--ds-accent)}.relation__add:disabled{opacity:.5;cursor:not-allowed;color:var(--ds-text-muted)}\n"], dependencies: [{ kind: "ngmodule", type: MatFormFieldModule }, { kind: "component", type: i1.MatFormField, selector: "mat-form-field", inputs: ["hideRequiredMarker", "color", "floatLabel", "appearance", "subscriptSizing", "hintLabel"], exportAs: ["matFormField"] }, { kind: "ngmodule", type: MatInputModule }, { kind: "directive", type: i2.MatInput, selector: "input[matInput], textarea[matInput], select[matNativeControl],      input[matNativeControl], textarea[matNativeControl]", inputs: ["disabled", "id", "placeholder", "name", "required", "type", "errorStateMatcher", "aria-describedby", "value", "readonly", "disabledInteractive"], exportAs: ["matInput"] }, { kind: "ngmodule", type: MatSelectModule }, { kind: "component", type: i3$2.MatSelect, selector: "mat-select", inputs: ["aria-describedby", "panelClass", "disabled", "disableRipple", "tabIndex", "hideSingleSelectionIndicator", "placeholder", "required", "multiple", "disableOptionCentering", "compareWith", "value", "aria-label", "aria-labelledby", "errorStateMatcher", "typeaheadDebounceInterval", "sortComparator", "id", "panelWidth", "canSelectNullableOptions"], outputs: ["openedChange", "opened", "closed", "selectionChange", "valueChange"], exportAs: ["matSelect"] }, { kind: "component", type: i3$2.MatOption, selector: "mat-option", inputs: ["value", "id", "disabled"], outputs: ["onSelectionChange"], exportAs: ["matOption"] }, { kind: "component", type: SelectFieldComponent, selector: "ds-select-field", inputs: ["label", "primitive", "value", "errors"], outputs: ["valueChange"] }, { kind: "component", type: FieldHostComponent, selector: "ds-field-host", inputs: ["primitive", "value", "label", "path", "errors"], outputs: ["changed"] }], changeDetection: i0.ChangeDetectionStrategy.OnPush });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "20.3.33", ngImport: i0, type: RelationFieldComponent, decorators: [{
            type: Component,
            args: [{ selector: 'ds-relation-field', standalone: true, imports: [MatFormFieldModule, MatInputModule, MatSelectModule, SelectFieldComponent, FieldHostComponent], changeDetection: ChangeDetectionStrategy.OnPush, template: `
    <div class="relation">
      <div class="relation__head">
        <span class="relation__name">{{ title() }}</span>
      </div>

      @if (ruleSet().rules.length) {
        <div class="relation__conditions">
          @for (rule of ruleSet().rules; track $index; let ruleIndex = $index) {
            @if (!$first) {
              <button type="button" class="relation__joiner" (click)="toggleCombine()" title="Toggle AND / OR">
                {{ ruleSet().combine }}
              </button>
            }
            <div class="relation__rule">
              <div class="relation__rule-head">
                @let target = facade.describeNode(rule.target);
                <button
                  type="button"
                  class="relation__target"
                  title="Pick another target on canvas"
                  (click)="repick(ruleIndex)"
                  (mouseenter)="facade.highlight([rule.target])"
                  (mouseleave)="facade.clearHighlight()"
                  (focus)="facade.highlight([rule.target])"
                  (blur)="facade.clearHighlight()"
                >
                  <span class="material-icons" aria-hidden="true">ads_click</span>
                  <span class="relation__target-label">
                    {{ target.name }}
                    @if (target.type) {
                      <span class="relation__target-type">{{ target.type }}</span>
                    }
                  </span>
                </button>
                <button type="button" class="relation__remove" (click)="removeAt(ruleIndex); $event.stopPropagation()">
                  <span class="material-icons" aria-hidden="true">close</span>
                </button>
              </div>
              <div class="relation__rule-body">
                @if (isCustom()) {
                  @for (field of customFields(); track field.key) {
                    <ds-field-host
                      [primitive]="field.primitive"
                      [value]="ruleProp(rule, field.key)"
                      [label]="field.label"
                      [path]="[field.key]"
                      (changed)="setRuleProp(ruleIndex, $event)"
                    />
                  }
                } @else {
                  <mat-form-field appearance="outline" class="ds-field relation__op" subscriptSizing="dynamic">
                    <mat-select [value]="rule.operator" (selectionChange)="setOperator(ruleIndex, $event.value)">
                      @for (op of operators(); track op) {
                        <mat-option [value]="op">{{ labelOf(op) }}</mat-option>
                      }
                    </mat-select>
                  </mat-form-field>
                  @switch (valueShape(rule.operator)) {
                    @case ('single') {
                      <mat-form-field appearance="outline" class="ds-field relation__value" subscriptSizing="dynamic">
                        <input
                          matInput
                          [value]="asText(rule.value)"
                          placeholder="Enter a value"
                          (input)="setValue(ruleIndex, $any($event.target).value)"
                        />
                      </mat-form-field>
                    }
                    @case ('list') {
                      <ds-select-field
                        class="relation__value"
                        label="Values"
                        [primitive]="listPrimitive"
                        [value]="$any(rule.value)"
                        (valueChange)="setValue(ruleIndex, $any($event))"
                      />
                    }
                  }
                }
              </div>
            </div>
          }
        </div>
      }

      <button type="button" class="relation__add" [disabled]="!targets().length" (click)="addCondition()">
        <span class="material-icons" aria-hidden="true">add</span>
        {{ ruleSet().rules.length ? 'Add condition' : 'Add a condition' }}
      </button>
    </div>
  `, styles: [".relation{display:flex;flex-direction:column;gap:10px}.relation__head{display:flex;align-items:center}.relation__name{font-weight:600;font-size:.9rem;color:var(--ds-text)}.relation__conditions{display:flex;flex-direction:column;gap:10px;padding-left:12px;border-left:2px solid var(--ds-accent-ring, var(--ds-accent-soft))}.relation__rule{display:flex;flex-direction:column;gap:8px}.relation__rule-head{display:flex;align-items:center;gap:6px}.relation__rule-body{display:flex;flex-direction:column;gap:8px}.relation__target{display:inline-flex;align-items:center;gap:5px;flex:1 1 auto;min-width:0;padding:6px 10px;border:1px solid var(--ds-accent);border-radius:999px;background:var(--ds-accent-soft);color:var(--ds-accent);font-size:.8rem;font-weight:600;cursor:pointer}.relation__target .material-icons{font-size:15px;flex:0 0 auto}.relation__target:hover{filter:brightness(.96)}.relation__target-label{overflow:hidden;white-space:nowrap;text-overflow:ellipsis}.relation__target-type{margin-left:4px;font-weight:500;opacity:.65}.relation__op,.relation__value{display:block;width:100%}.relation__rule-body ::ng-deep .ds-field{display:block;width:100%}.relation__rule-body ::ng-deep .ds-enum-label{display:block;margin-bottom:6px;font-size:11px;font-weight:600;letter-spacing:.02em;text-transform:uppercase;color:var(--ds-text-muted)}.relation__rule-body ::ng-deep .ds-toggle-group{display:flex;width:100%;border-radius:var(--ds-radius-sm);overflow:hidden}.relation__rule-body ::ng-deep .ds-toggle-group .mat-button-toggle{flex:1;font-size:12px}.relation__rule-body ::ng-deep .ds-toggle-group .mat-button-toggle-label-content{line-height:32px;padding:0 10px}.relation__rule-body ::ng-deep .ds-hint{margin-top:6px;font-size:12px;line-height:16px;color:var(--ds-text-muted)}.relation__rule-body ::ng-deep .ds-error{margin-top:6px;font-size:12px;line-height:16px;color:#ef4444}.relation__joiner{align-self:flex-start;padding:2px 12px;border:1px solid var(--ds-accent);border-radius:999px;background:var(--ds-sidebar-bg, var(--ds-card-bg));color:var(--ds-accent);font-size:.7rem;font-weight:700;text-transform:uppercase;letter-spacing:.04em;cursor:pointer}.relation__joiner:hover{background:var(--ds-accent-soft)}.relation__remove{flex:0 0 auto;display:inline-flex;align-items:center;justify-content:center;width:30px;height:30px;border:none;border-radius:8px;background:transparent;color:var(--ds-text-muted);cursor:pointer}.relation__remove .material-icons{font-size:17px}.relation__remove:hover{color:#ef4444;background:#ef44441a}.relation__add{display:inline-flex;align-items:center;gap:6px;align-self:flex-start;padding:6px 10px;border:1px dashed var(--ds-card-border);border-radius:8px;background:transparent;color:var(--ds-accent);font-size:.8rem;font-weight:600;cursor:pointer}.relation__add .material-icons{font-size:16px}.relation__add:hover:not(:disabled){background:var(--ds-accent-soft);border-color:var(--ds-accent)}.relation__add:disabled{opacity:.5;cursor:not-allowed;color:var(--ds-text-muted)}\n"] }]
        }], propDecorators: { node: [{ type: i0.Input, args: [{ isSignal: true, alias: "node", required: true }] }], name: [{ type: i0.Input, args: [{ isSignal: true, alias: "name", required: true }] }], descriptor: [{ type: i0.Input, args: [{ isSignal: true, alias: "descriptor", required: true }] }] } });

class RelationsFormComponent {
    definition = input.required(...(ngDevMode ? [{ debugName: "definition" }] : []));
    node = input.required(...(ngDevMode ? [{ debugName: "node" }] : []));
    entries = computed(() => listify(this.definition().relations, (name, descriptor) => ({ name, descriptor })), ...(ngDevMode ? [{ debugName: "entries" }] : []));
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "20.3.33", ngImport: i0, type: RelationsFormComponent, deps: [], target: i0.ɵɵFactoryTarget.Component });
    static ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "17.0.0", version: "20.3.33", type: RelationsFormComponent, isStandalone: true, selector: "ds-relations-form", inputs: { definition: { classPropertyName: "definition", publicName: "definition", isSignal: true, isRequired: true, transformFunction: null }, node: { classPropertyName: "node", publicName: "node", isSignal: true, isRequired: true, transformFunction: null } }, ngImport: i0, template: `
    @if (entries().length) {
      <div class="form">
        @for (entry of entries(); track entry.name; let first = $first) {
          @if (!first) {
            <mat-divider />
          }
          <ds-relation-field [node]="node()" [name]="entry.name" [descriptor]="entry.descriptor" />
        }
      </div>
    } @else {
      <p class="form__empty">This component declares no relations.</p>
    }
  `, isInline: true, styles: [".form{display:flex;flex-direction:column;gap:16px}.form__empty{margin:0;color:var(--ds-text-muted);font-size:.85rem}mat-divider{margin:0}\n"], dependencies: [{ kind: "component", type: RelationFieldComponent, selector: "ds-relation-field", inputs: ["node", "name", "descriptor"] }, { kind: "ngmodule", type: MatDividerModule }, { kind: "component", type: i1$5.MatDivider, selector: "mat-divider", inputs: ["vertical", "inset"] }], changeDetection: i0.ChangeDetectionStrategy.OnPush });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "20.3.33", ngImport: i0, type: RelationsFormComponent, decorators: [{
            type: Component,
            args: [{ selector: 'ds-relations-form', standalone: true, imports: [RelationFieldComponent, MatDividerModule], changeDetection: ChangeDetectionStrategy.OnPush, template: `
    @if (entries().length) {
      <div class="form">
        @for (entry of entries(); track entry.name; let first = $first) {
          @if (!first) {
            <mat-divider />
          }
          <ds-relation-field [node]="node()" [name]="entry.name" [descriptor]="entry.descriptor" />
        }
      </div>
    } @else {
      <p class="form__empty">This component declares no relations.</p>
    }
  `, styles: [".form{display:flex;flex-direction:column;gap:16px}.form__empty{margin:0;color:var(--ds-text-muted);font-size:.85rem}mat-divider{margin:0}\n"] }]
        }], propDecorators: { definition: [{ type: i0.Input, args: [{ isSignal: true, alias: "definition", required: true }] }], node: [{ type: i0.Input, args: [{ isSignal: true, alias: "node", required: true }] }] } });

class InspectorComponent {
    facade = inject(StudioFacade);
    node = this.facade.inspectedNode;
    definition = computed(() => this.facade.component(this.node().name), ...(ngDevMode ? [{ debugName: "definition" }] : []));
    hasRelations = computed(() => Object.keys(this.definition().relations).length > 0, ...(ngDevMode ? [{ debugName: "hasRelations" }] : []));
    errors = computed(() => this.facade.errorsOf(this.node().id), ...(ngDevMode ? [{ debugName: "errors" }] : []));
    onEscape() {
        if (this.facade.picking())
            this.facade.cancelPick();
        else
            this.close();
    }
    close() {
        this.facade.closeInspector();
    }
    onPropChange(id, change) {
        this.facade.setProp(id, change.path, change.value);
    }
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "20.3.33", ngImport: i0, type: InspectorComponent, deps: [], target: i0.ɵɵFactoryTarget.Component });
    static ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "17.0.0", version: "20.3.33", type: InspectorComponent, isStandalone: true, selector: "ds-inspector", host: { listeners: { "document:keydown.escape": "onEscape()" } }, ngImport: i0, template: `
    @let n = node();
    @let def = definition();
    <div class="scrim" (click)="close()" aria-hidden="true"></div>
    <aside class="inspector" role="dialog">
      <header class="inspector__head">
        <div class="inspector__title-wrap">
          <span class="inspector__icon" aria-hidden="true">
            <mat-icon>{{ facade.iconOf(n) }}</mat-icon>
          </span>
          <div class="inspector__titles">
            <span class="inspector__eyebrow">{{ def.title }}</span>
            <span class="inspector__title">{{ def.label }}</span>
          </div>
        </div>
        <button mat-icon-button class="inspector__close" (click)="close()">
          <mat-icon>close</mat-icon>
        </button>
      </header>

      <div class="inspector__body">
        <section class="inspector__section">
          <h3 class="inspector__section-title">Appearance</h3>
          <ds-meta-fields [node]="n" [definition]="def" (changed)="facade.setMeta(n.id, $event)" />
        </section>

        <mat-divider />

        <section class="inspector__section">
          <h3 class="inspector__section-title">Props</h3>
          <ds-props-form
            [definition]="def"
            [values]="n.props"
            [errors]="errors()"
            (changed)="onPropChange(n.id, $event)"
          />
        </section>

        @if (hasRelations()) {
          <mat-divider />

          <section class="inspector__section">
            <h3 class="inspector__section-title">Behavior</h3>
            <ds-relations-form [definition]="def" [node]="n" />
          </section>
        }
      </div>
    </aside>
  `, isInline: true, styles: [":host{display:contents}.scrim{display:none;position:absolute;inset:0;background:#10182866;-webkit-backdrop-filter:blur(1px);backdrop-filter:blur(1px);animation:ds-inspector-scrim .16s ease-out both;z-index:10}.inspector{display:flex;flex-direction:column;width:360px;height:100%;box-sizing:border-box;background:var(--ds-sidebar-bg);border-left:1px solid var(--ds-border);z-index:11}.inspector__head{display:flex;align-items:center;gap:10px;padding:14px 16px;border-bottom:1px solid var(--ds-border)}.inspector__title-wrap{display:flex;align-items:center;gap:10px;flex:1;min-width:0}.inspector__icon{display:inline-flex;align-items:center;justify-content:center;width:32px;height:32px;color:var(--ds-accent);background:var(--ds-accent-soft);border-radius:8px;flex:0 0 auto}.inspector__icon mat-icon{font-size:18px;width:18px;height:18px}.inspector__titles{display:flex;flex-direction:column;min-width:0}.inspector__eyebrow{font-size:10px;letter-spacing:.04em;text-transform:uppercase;color:var(--ds-text-muted);overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.inspector__title{font-size:14px;font-weight:600;color:var(--ds-text);overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.inspector__close{color:var(--ds-text-muted);flex:0 0 auto}.inspector__body{display:flex;flex-direction:column;gap:20px;padding:16px;overflow-y:auto;flex:1;min-height:0}.inspector__section{display:flex;flex-direction:column;gap:10px}.inspector__section-title{margin:0;font-size:11px;font-weight:700;letter-spacing:.06em;text-transform:uppercase;color:var(--ds-text-muted)}:host ::ng-deep .mat-mdc-form-field{--mat-form-field-container-height: 40px;--mat-form-field-container-vertical-padding: 8px;--mat-form-field-container-text-size: 13px;--mat-form-field-subscript-text-size: 11px}:host ::ng-deep .mat-mdc-form-field .mat-mdc-text-field-wrapper{padding-bottom:0}:host ::ng-deep .mat-mdc-form-field .mdc-text-field__input{font-size:13px}:host ::ng-deep .mat-mdc-checkbox{--mdc-checkbox-state-layer-size: 28px;display:flex;align-items:center;height:32px}:host ::ng-deep .mat-mdc-checkbox .mdc-form-field{display:flex;align-items:center;font-size:13px;line-height:1}:host ::ng-deep .mat-mdc-checkbox label{font-size:13px;cursor:pointer}:host ::ng-deep .mat-button-toggle-group .mat-button-toggle-label-content{line-height:32px;padding:0 12px;font-size:12px}@container ds-studio (max-width: 1199px){.scrim{display:block}.inspector{position:absolute;inset-block:0;right:0;box-shadow:-16px 0 32px #1018282e;animation:ds-inspector-in .26s cubic-bezier(.2,.8,.2,1) both}}@container ds-studio (max-width: 479px){.inspector{inset-block-start:auto;left:0;width:100%;max-height:80%;border-left:none;border-top:1px solid var(--ds-border);border-radius:var(--ds-radius) var(--ds-radius) 0 0;animation:ds-inspector-up .22s cubic-bezier(.2,.8,.2,1) both}}@keyframes ds-inspector-in{0%{transform:translate(100%);opacity:0}to{transform:translate(0);opacity:1}}@keyframes ds-inspector-up{0%{transform:translateY(100%)}to{transform:translateY(0)}}@keyframes ds-inspector-scrim{0%{opacity:0}to{opacity:1}}\n"], dependencies: [{ kind: "ngmodule", type: MatIconModule }, { kind: "component", type: i3.MatIcon, selector: "mat-icon", inputs: ["color", "inline", "svgIcon", "fontSet", "fontIcon"], exportAs: ["matIcon"] }, { kind: "component", type: MatIconButton, selector: "button[mat-icon-button], a[mat-icon-button], button[matIconButton], a[matIconButton]", exportAs: ["matButton", "matAnchor"] }, { kind: "ngmodule", type: MatDividerModule }, { kind: "component", type: i1$5.MatDivider, selector: "mat-divider", inputs: ["vertical", "inset"] }, { kind: "component", type: MetaFieldsComponent, selector: "ds-meta-fields", inputs: ["node", "definition"], outputs: ["changed"] }, { kind: "component", type: PropsFormComponent, selector: "ds-props-form", inputs: ["definition", "values", "errors"], outputs: ["changed"] }, { kind: "component", type: RelationsFormComponent, selector: "ds-relations-form", inputs: ["definition", "node"] }], changeDetection: i0.ChangeDetectionStrategy.OnPush });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "20.3.33", ngImport: i0, type: InspectorComponent, decorators: [{
            type: Component,
            args: [{ selector: 'ds-inspector', standalone: true, imports: [
                        MatIconModule,
                        MatIconButton,
                        MatDividerModule,
                        MetaFieldsComponent,
                        PropsFormComponent,
                        RelationsFormComponent
                    ], changeDetection: ChangeDetectionStrategy.OnPush, template: `
    @let n = node();
    @let def = definition();
    <div class="scrim" (click)="close()" aria-hidden="true"></div>
    <aside class="inspector" role="dialog">
      <header class="inspector__head">
        <div class="inspector__title-wrap">
          <span class="inspector__icon" aria-hidden="true">
            <mat-icon>{{ facade.iconOf(n) }}</mat-icon>
          </span>
          <div class="inspector__titles">
            <span class="inspector__eyebrow">{{ def.title }}</span>
            <span class="inspector__title">{{ def.label }}</span>
          </div>
        </div>
        <button mat-icon-button class="inspector__close" (click)="close()">
          <mat-icon>close</mat-icon>
        </button>
      </header>

      <div class="inspector__body">
        <section class="inspector__section">
          <h3 class="inspector__section-title">Appearance</h3>
          <ds-meta-fields [node]="n" [definition]="def" (changed)="facade.setMeta(n.id, $event)" />
        </section>

        <mat-divider />

        <section class="inspector__section">
          <h3 class="inspector__section-title">Props</h3>
          <ds-props-form
            [definition]="def"
            [values]="n.props"
            [errors]="errors()"
            (changed)="onPropChange(n.id, $event)"
          />
        </section>

        @if (hasRelations()) {
          <mat-divider />

          <section class="inspector__section">
            <h3 class="inspector__section-title">Behavior</h3>
            <ds-relations-form [definition]="def" [node]="n" />
          </section>
        }
      </div>
    </aside>
  `, styles: [":host{display:contents}.scrim{display:none;position:absolute;inset:0;background:#10182866;-webkit-backdrop-filter:blur(1px);backdrop-filter:blur(1px);animation:ds-inspector-scrim .16s ease-out both;z-index:10}.inspector{display:flex;flex-direction:column;width:360px;height:100%;box-sizing:border-box;background:var(--ds-sidebar-bg);border-left:1px solid var(--ds-border);z-index:11}.inspector__head{display:flex;align-items:center;gap:10px;padding:14px 16px;border-bottom:1px solid var(--ds-border)}.inspector__title-wrap{display:flex;align-items:center;gap:10px;flex:1;min-width:0}.inspector__icon{display:inline-flex;align-items:center;justify-content:center;width:32px;height:32px;color:var(--ds-accent);background:var(--ds-accent-soft);border-radius:8px;flex:0 0 auto}.inspector__icon mat-icon{font-size:18px;width:18px;height:18px}.inspector__titles{display:flex;flex-direction:column;min-width:0}.inspector__eyebrow{font-size:10px;letter-spacing:.04em;text-transform:uppercase;color:var(--ds-text-muted);overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.inspector__title{font-size:14px;font-weight:600;color:var(--ds-text);overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.inspector__close{color:var(--ds-text-muted);flex:0 0 auto}.inspector__body{display:flex;flex-direction:column;gap:20px;padding:16px;overflow-y:auto;flex:1;min-height:0}.inspector__section{display:flex;flex-direction:column;gap:10px}.inspector__section-title{margin:0;font-size:11px;font-weight:700;letter-spacing:.06em;text-transform:uppercase;color:var(--ds-text-muted)}:host ::ng-deep .mat-mdc-form-field{--mat-form-field-container-height: 40px;--mat-form-field-container-vertical-padding: 8px;--mat-form-field-container-text-size: 13px;--mat-form-field-subscript-text-size: 11px}:host ::ng-deep .mat-mdc-form-field .mat-mdc-text-field-wrapper{padding-bottom:0}:host ::ng-deep .mat-mdc-form-field .mdc-text-field__input{font-size:13px}:host ::ng-deep .mat-mdc-checkbox{--mdc-checkbox-state-layer-size: 28px;display:flex;align-items:center;height:32px}:host ::ng-deep .mat-mdc-checkbox .mdc-form-field{display:flex;align-items:center;font-size:13px;line-height:1}:host ::ng-deep .mat-mdc-checkbox label{font-size:13px;cursor:pointer}:host ::ng-deep .mat-button-toggle-group .mat-button-toggle-label-content{line-height:32px;padding:0 12px;font-size:12px}@container ds-studio (max-width: 1199px){.scrim{display:block}.inspector{position:absolute;inset-block:0;right:0;box-shadow:-16px 0 32px #1018282e;animation:ds-inspector-in .26s cubic-bezier(.2,.8,.2,1) both}}@container ds-studio (max-width: 479px){.inspector{inset-block-start:auto;left:0;width:100%;max-height:80%;border-left:none;border-top:1px solid var(--ds-border);border-radius:var(--ds-radius) var(--ds-radius) 0 0;animation:ds-inspector-up .22s cubic-bezier(.2,.8,.2,1) both}}@keyframes ds-inspector-in{0%{transform:translate(100%);opacity:0}to{transform:translate(0);opacity:1}}@keyframes ds-inspector-up{0%{transform:translateY(100%)}to{transform:translateY(0)}}@keyframes ds-inspector-scrim{0%{opacity:0}to{opacity:1}}\n"] }]
        }], propDecorators: { onEscape: [{
                type: HostListener,
                args: ['document:keydown.escape']
            }] } });

const viewerTheme = EditorView.theme({
    '&': { height: '100%' },
    '.cm-scroller': { overflow: 'auto' },
    '.cm-content': { padding: '12px 0' },
    '.cm-foldGutter span': { color: 'var(--ds-text-muted)', cursor: 'pointer' },
    '.cm-foldPlaceholder': {
        padding: '0 6px',
        color: 'var(--ds-text-muted)',
        backgroundColor: 'var(--ds-chip-bg)',
        border: 'none',
        borderRadius: '4px'
    }
});
class CodeViewerComponent {
    value = input.required(...(ngDevMode ? [{ debugName: "value" }] : []));
    host = viewChild.required('host');
    #view;
    constructor() {
        afterNextRender(() => {
            this.#view = new EditorView({
                parent: this.host().nativeElement,
                state: EditorState.create({ doc: this.value(), extensions: this.#extensions() })
            });
        });
        effect(() => {
            const value = this.value();
            const view = this.#view;
            if (!view)
                return;
            view.setState(EditorState.create({ doc: value, extensions: this.#extensions() }));
        });
        inject(DestroyRef).onDestroy(() => this.#view?.destroy());
    }
    #extensions() {
        return [
            lineNumbers(),
            json(),
            foldGutter(),
            drawSelection(),
            bracketMatching(),
            syntaxHighlighting(codeHighlightStyle),
            EditorState.readOnly.of(true),
            keymap.of([...defaultKeymap, ...foldKeymap]),
            codeEditorTheme,
            viewerTheme
        ];
    }
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "20.3.33", ngImport: i0, type: CodeViewerComponent, deps: [], target: i0.ɵɵFactoryTarget.Component });
    static ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "17.2.0", version: "20.3.33", type: CodeViewerComponent, isStandalone: true, selector: "ds-code-viewer", inputs: { value: { classPropertyName: "value", publicName: "value", isSignal: true, isRequired: true, transformFunction: null } }, viewQueries: [{ propertyName: "host", first: true, predicate: ["host"], descendants: true, isSignal: true }], ngImport: i0, template: `<div #host class="viewer"></div>`, isInline: true, styles: [":host{display:block;min-height:0;height:100%;--ds-code-font: \"JetBrains Mono\", \"SF Mono\", ui-monospace, Menlo, Consolas, monospace}.viewer{height:100%}\n"], changeDetection: i0.ChangeDetectionStrategy.OnPush });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "20.3.33", ngImport: i0, type: CodeViewerComponent, decorators: [{
            type: Component,
            args: [{ selector: 'ds-code-viewer', standalone: true, changeDetection: ChangeDetectionStrategy.OnPush, template: `<div #host class="viewer"></div>`, styles: [":host{display:block;min-height:0;height:100%;--ds-code-font: \"JetBrains Mono\", \"SF Mono\", ui-monospace, Menlo, Consolas, monospace}.viewer{height:100%}\n"] }]
        }], ctorParameters: () => [], propDecorators: { value: [{ type: i0.Input, args: [{ isSignal: true, alias: "value", required: true }] }], host: [{ type: i0.ViewChild, args: ['host', { isSignal: true }] }] } });

function downloadText(filename, text, type) {
    const url = URL.createObjectURL(new Blob([text], { type }));
    const link = Object.assign(document.createElement('a'), { href: url, download: filename });
    link.click();
    URL.revokeObjectURL(url);
}
async function copyText(text) {
    try {
        await navigator.clipboard.writeText(text);
        return true;
    }
    catch {
        return false;
    }
}

class OutputActionsComponent {
    text = input.required(...(ngDevMode ? [{ debugName: "text" }] : []));
    filename = input.required(...(ngDevMode ? [{ debugName: "filename" }] : []));
    mime = input('application/json', ...(ngDevMode ? [{ debugName: "mime" }] : []));
    disabled = input(false, ...(ngDevMode ? [{ debugName: "disabled" }] : []));
    copied = signal(false, ...(ngDevMode ? [{ debugName: "copied" }] : []));
    #reset;
    constructor() {
        inject(DestroyRef).onDestroy(() => clearTimeout(this.#reset));
    }
    async copy() {
        if (!(await copyText(this.text())))
            return;
        this.copied.set(true);
        clearTimeout(this.#reset);
        this.#reset = setTimeout(() => this.copied.set(false), 1500);
    }
    download() {
        downloadText(this.filename(), this.text(), this.mime());
    }
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "20.3.33", ngImport: i0, type: OutputActionsComponent, deps: [], target: i0.ɵɵFactoryTarget.Component });
    static ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "17.1.0", version: "20.3.33", type: OutputActionsComponent, isStandalone: true, selector: "ds-output-actions", inputs: { text: { classPropertyName: "text", publicName: "text", isSignal: true, isRequired: true, transformFunction: null }, filename: { classPropertyName: "filename", publicName: "filename", isSignal: true, isRequired: true, transformFunction: null }, mime: { classPropertyName: "mime", publicName: "mime", isSignal: true, isRequired: false, transformFunction: null }, disabled: { classPropertyName: "disabled", publicName: "disabled", isSignal: true, isRequired: false, transformFunction: null } }, ngImport: i0, template: `
    <button type="button" class="action" [disabled]="disabled()" (click)="copy()">
      <span class="material-icons" aria-hidden="true">{{ copied() ? 'check' : 'content_copy' }}</span>
      {{ copied() ? 'Copied' : 'Copy' }}
    </button>
    <button type="button" class="action" [disabled]="disabled()" (click)="download()">
      <span class="material-icons" aria-hidden="true">download</span>
      Download
    </button>
  `, isInline: true, styles: [":host{display:inline-flex;align-items:center;gap:6px}.action{display:inline-flex;align-items:center;gap:6px;height:30px;padding:0 12px;font:inherit;font-size:13px;font-weight:500;color:var(--ds-text-muted);background:transparent;border:1px solid var(--ds-border);border-radius:var(--ds-radius-sm);cursor:pointer;transition:color .12s ease,background .12s ease,border-color .12s ease}.action .material-icons{font-size:16px}.action:hover:not(:disabled){color:var(--ds-accent);background:var(--ds-accent-soft);border-color:transparent}.action:focus-visible{outline:2px solid var(--ds-accent);outline-offset:1px}.action:disabled{opacity:.45;cursor:not-allowed}\n"], changeDetection: i0.ChangeDetectionStrategy.OnPush });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "20.3.33", ngImport: i0, type: OutputActionsComponent, decorators: [{
            type: Component,
            args: [{ selector: 'ds-output-actions', standalone: true, changeDetection: ChangeDetectionStrategy.OnPush, template: `
    <button type="button" class="action" [disabled]="disabled()" (click)="copy()">
      <span class="material-icons" aria-hidden="true">{{ copied() ? 'check' : 'content_copy' }}</span>
      {{ copied() ? 'Copied' : 'Copy' }}
    </button>
    <button type="button" class="action" [disabled]="disabled()" (click)="download()">
      <span class="material-icons" aria-hidden="true">download</span>
      Download
    </button>
  `, styles: [":host{display:inline-flex;align-items:center;gap:6px}.action{display:inline-flex;align-items:center;gap:6px;height:30px;padding:0 12px;font:inherit;font-size:13px;font-weight:500;color:var(--ds-text-muted);background:transparent;border:1px solid var(--ds-border);border-radius:var(--ds-radius-sm);cursor:pointer;transition:color .12s ease,background .12s ease,border-color .12s ease}.action .material-icons{font-size:16px}.action:hover:not(:disabled){color:var(--ds-accent);background:var(--ds-accent-soft);border-color:transparent}.action:focus-visible{outline:2px solid var(--ds-accent);outline-offset:1px}.action:disabled{opacity:.45;cursor:not-allowed}\n"] }]
        }], ctorParameters: () => [], propDecorators: { text: [{ type: i0.Input, args: [{ isSignal: true, alias: "text", required: true }] }], filename: [{ type: i0.Input, args: [{ isSignal: true, alias: "filename", required: true }] }], mime: [{ type: i0.Input, args: [{ isSignal: true, alias: "mime", required: false }] }], disabled: [{ type: i0.Input, args: [{ isSignal: true, alias: "disabled", required: false }] }] } });

class ViewPanelComponent {
    heading = input.required(...(ngDevMode ? [{ debugName: "heading" }] : []));
    meta = input(...(ngDevMode ? [undefined, { debugName: "meta" }] : []));
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "20.3.33", ngImport: i0, type: ViewPanelComponent, deps: [], target: i0.ɵɵFactoryTarget.Component });
    static ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "17.0.0", version: "20.3.33", type: ViewPanelComponent, isStandalone: true, selector: "ds-view-panel", inputs: { heading: { classPropertyName: "heading", publicName: "heading", isSignal: true, isRequired: true, transformFunction: null }, meta: { classPropertyName: "meta", publicName: "meta", isSignal: true, isRequired: false, transformFunction: null } }, ngImport: i0, template: `
    <section class="panel">
      <header class="panel__bar">
        <div class="panel__lead">
          <span class="panel__title">{{ heading() }}</span>
          @if (meta(); as meta) {
            <span class="panel__meta">{{ meta }}</span>
          }
        </div>
        <div class="panel__actions"><ng-content select="[panelActions]" /></div>
      </header>
      <div class="panel__body"><ng-content /></div>
    </section>
  `, isInline: true, styles: [":host{display:block;height:100%;min-height:0;box-sizing:border-box;padding:16px;background:var(--ds-canvas-bg)}.panel{display:flex;flex-direction:column;height:100%;min-height:0;overflow:hidden;background:var(--ds-card-bg);border:1px solid var(--ds-card-border);border-radius:var(--ds-radius);box-shadow:var(--ds-card-shadow)}.panel__bar{display:flex;align-items:center;justify-content:space-between;gap:12px;min-height:48px;padding:8px 12px 8px 16px;box-sizing:border-box;border-bottom:1px solid var(--ds-border)}.panel__lead,.panel__actions{display:flex;align-items:center;gap:8px;min-width:0}.panel__lead{align-items:baseline}.panel__title{font-size:13px;font-weight:600;color:var(--ds-text)}.panel__meta{font-size:12px;color:var(--ds-text-muted)}.panel__body{flex:1 1 auto;min-height:0}\n"], changeDetection: i0.ChangeDetectionStrategy.OnPush });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "20.3.33", ngImport: i0, type: ViewPanelComponent, decorators: [{
            type: Component,
            args: [{ selector: 'ds-view-panel', standalone: true, changeDetection: ChangeDetectionStrategy.OnPush, template: `
    <section class="panel">
      <header class="panel__bar">
        <div class="panel__lead">
          <span class="panel__title">{{ heading() }}</span>
          @if (meta(); as meta) {
            <span class="panel__meta">{{ meta }}</span>
          }
        </div>
        <div class="panel__actions"><ng-content select="[panelActions]" /></div>
      </header>
      <div class="panel__body"><ng-content /></div>
    </section>
  `, styles: [":host{display:block;height:100%;min-height:0;box-sizing:border-box;padding:16px;background:var(--ds-canvas-bg)}.panel{display:flex;flex-direction:column;height:100%;min-height:0;overflow:hidden;background:var(--ds-card-bg);border:1px solid var(--ds-card-border);border-radius:var(--ds-radius);box-shadow:var(--ds-card-shadow)}.panel__bar{display:flex;align-items:center;justify-content:space-between;gap:12px;min-height:48px;padding:8px 12px 8px 16px;box-sizing:border-box;border-bottom:1px solid var(--ds-border)}.panel__lead,.panel__actions{display:flex;align-items:center;gap:8px;min-width:0}.panel__lead{align-items:baseline}.panel__title{font-size:13px;font-weight:600;color:var(--ds-text)}.panel__meta{font-size:12px;color:var(--ds-text-muted)}.panel__body{flex:1 1 auto;min-height:0}\n"] }]
        }], propDecorators: { heading: [{ type: i0.Input, args: [{ isSignal: true, alias: "heading", required: true }] }], meta: [{ type: i0.Input, args: [{ isSignal: true, alias: "meta", required: false }] }] } });

class AdapterViewComponent {
    #views = inject(StudioViews);
    json = computed(() => JSON.stringify(this.#views.outputs(), null, 2), ...(ngDevMode ? [{ debugName: "json" }] : []));
    failures = computed(() => this.#views.results().filter(result => result.error), ...(ngDevMode ? [{ debugName: "failures" }] : []));
    meta = computed(() => {
        const count = this.#views.results().length;
        return `${count} ${count === 1 ? 'adapter' : 'adapters'}`;
    }, ...(ngDevMode ? [{ debugName: "meta" }] : []));
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "20.3.33", ngImport: i0, type: AdapterViewComponent, deps: [], target: i0.ɵɵFactoryTarget.Component });
    static ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "17.0.0", version: "20.3.33", type: AdapterViewComponent, isStandalone: true, selector: "ds-adapter-view", ngImport: i0, template: `
    <ds-view-panel heading="Output" [meta]="meta()">
      <ds-output-actions panelActions [text]="json()" filename="output.json" />
      <div class="output">
        @for (failure of failures(); track failure.key) {
          <div class="error" role="alert">
            <span class="material-icons" aria-hidden="true">error_outline</span>
            <div>
              <div class="error__title">{{ failure.label }} could not map the AST</div>
              <div class="error__message">{{ failure.error }}</div>
            </div>
          </div>
        }
        <ds-code-viewer class="output__code" [value]="json()" />
      </div>
    </ds-view-panel>
  `, isInline: true, styles: [":host{display:block;height:100%;min-height:0}.output{display:flex;flex-direction:column;height:100%}.output__code{flex:1 1 auto;min-height:0}.error{display:flex;align-items:flex-start;gap:10px;margin:12px 16px 0;padding:12px 14px;color:var(--ds-code-error);background:color-mix(in srgb,var(--ds-code-error) 8%,transparent);border:1px solid color-mix(in srgb,var(--ds-code-error) 30%,transparent);border-radius:var(--ds-radius-sm)}.error .material-icons{font-size:18px}.error__title{font-size:13px;font-weight:600}.error__message{margin-top:2px;font:12px/1.5 var(--ds-code-font, ui-monospace, monospace);overflow-wrap:anywhere}\n"], dependencies: [{ kind: "component", type: ViewPanelComponent, selector: "ds-view-panel", inputs: ["heading", "meta"] }, { kind: "component", type: CodeViewerComponent, selector: "ds-code-viewer", inputs: ["value"] }, { kind: "component", type: OutputActionsComponent, selector: "ds-output-actions", inputs: ["text", "filename", "mime", "disabled"] }], changeDetection: i0.ChangeDetectionStrategy.OnPush });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "20.3.33", ngImport: i0, type: AdapterViewComponent, decorators: [{
            type: Component,
            args: [{ selector: 'ds-adapter-view', standalone: true, imports: [ViewPanelComponent, CodeViewerComponent, OutputActionsComponent], changeDetection: ChangeDetectionStrategy.OnPush, template: `
    <ds-view-panel heading="Output" [meta]="meta()">
      <ds-output-actions panelActions [text]="json()" filename="output.json" />
      <div class="output">
        @for (failure of failures(); track failure.key) {
          <div class="error" role="alert">
            <span class="material-icons" aria-hidden="true">error_outline</span>
            <div>
              <div class="error__title">{{ failure.label }} could not map the AST</div>
              <div class="error__message">{{ failure.error }}</div>
            </div>
          </div>
        }
        <ds-code-viewer class="output__code" [value]="json()" />
      </div>
    </ds-view-panel>
  `, styles: [":host{display:block;height:100%;min-height:0}.output{display:flex;flex-direction:column;height:100%}.output__code{flex:1 1 auto;min-height:0}.error{display:flex;align-items:flex-start;gap:10px;margin:12px 16px 0;padding:12px 14px;color:var(--ds-code-error);background:color-mix(in srgb,var(--ds-code-error) 8%,transparent);border:1px solid color-mix(in srgb,var(--ds-code-error) 30%,transparent);border-radius:var(--ds-radius-sm)}.error .material-icons{font-size:18px}.error__title{font-size:13px;font-weight:600}.error__message{margin-top:2px;font:12px/1.5 var(--ds-code-font, ui-monospace, monospace);overflow-wrap:anywhere}\n"] }]
        }] });

class AstViewComponent {
    #facade = inject(StudioFacade);
    json = computed(() => {
        const root = this.#facade.root();
        return root ? JSON.stringify(root, null, 2) : '';
    }, ...(ngDevMode ? [{ debugName: "json" }] : []));
    meta = computed(() => {
        const root = this.#facade.root();
        const count = root ? Array.from(walk(root)).length : 0;
        return `${count} ${count === 1 ? 'node' : 'nodes'}`;
    }, ...(ngDevMode ? [{ debugName: "meta" }] : []));
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "20.3.33", ngImport: i0, type: AstViewComponent, deps: [], target: i0.ɵɵFactoryTarget.Component });
    static ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "14.0.0", version: "20.3.33", type: AstViewComponent, isStandalone: true, selector: "ds-ast-view", ngImport: i0, template: `
    <ds-view-panel heading="AST" [meta]="meta()">
      <ds-output-actions panelActions [text]="json()" filename="ast.json" />
      <ds-code-viewer [value]="json()" />
    </ds-view-panel>
  `, isInline: true, styles: [":host{display:block;height:100%;min-height:0}\n"], dependencies: [{ kind: "component", type: ViewPanelComponent, selector: "ds-view-panel", inputs: ["heading", "meta"] }, { kind: "component", type: CodeViewerComponent, selector: "ds-code-viewer", inputs: ["value"] }, { kind: "component", type: OutputActionsComponent, selector: "ds-output-actions", inputs: ["text", "filename", "mime", "disabled"] }], changeDetection: i0.ChangeDetectionStrategy.OnPush });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "20.3.33", ngImport: i0, type: AstViewComponent, decorators: [{
            type: Component,
            args: [{ selector: 'ds-ast-view', standalone: true, imports: [ViewPanelComponent, CodeViewerComponent, OutputActionsComponent], changeDetection: ChangeDetectionStrategy.OnPush, template: `
    <ds-view-panel heading="AST" [meta]="meta()">
      <ds-output-actions panelActions [text]="json()" filename="ast.json" />
      <ds-code-viewer [value]="json()" />
    </ds-view-panel>
  `, styles: [":host{display:block;height:100%;min-height:0}\n"] }]
        }] });

class PreviewViewComponent {
    #facade = inject(StudioFacade);
    #views = inject(StudioViews);
    template = input.required(...(ngDevMode ? [{ debugName: "template" }] : []));
    context = computed(() => {
        const root = this.#facade.root();
        return root ? { $implicit: root, outputs: this.#views.outputs() } : null;
    }, ...(ngDevMode ? [{ debugName: "context" }] : []));
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "20.3.33", ngImport: i0, type: PreviewViewComponent, deps: [], target: i0.ɵɵFactoryTarget.Component });
    static ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "17.0.0", version: "20.3.33", type: PreviewViewComponent, isStandalone: true, selector: "ds-preview-view", inputs: { template: { classPropertyName: "template", publicName: "template", isSignal: true, isRequired: true, transformFunction: null } }, ngImport: i0, template: `
    <div class="preview">
      <div class="preview__stage">
        @if (context(); as ctx) {
          <ng-container *ngTemplateOutlet="template(); context: ctx" />
        }
      </div>
    </div>
  `, isInline: true, styles: [":host{display:block;height:100%;min-height:0}.preview{height:100%;overflow:auto;background:var(--ds-canvas-bg)}.preview__stage{box-sizing:border-box;max-width:880px;min-height:240px;margin:32px auto;padding:24px;color:var(--ds-text);background:var(--ds-card-bg);border:1px solid var(--ds-card-border);border-radius:var(--ds-radius);box-shadow:var(--ds-card-shadow)}\n"], dependencies: [{ kind: "directive", type: NgTemplateOutlet, selector: "[ngTemplateOutlet]", inputs: ["ngTemplateOutletContext", "ngTemplateOutlet", "ngTemplateOutletInjector"] }], changeDetection: i0.ChangeDetectionStrategy.OnPush });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "20.3.33", ngImport: i0, type: PreviewViewComponent, decorators: [{
            type: Component,
            args: [{ selector: 'ds-preview-view', standalone: true, imports: [NgTemplateOutlet], changeDetection: ChangeDetectionStrategy.OnPush, template: `
    <div class="preview">
      <div class="preview__stage">
        @if (context(); as ctx) {
          <ng-container *ngTemplateOutlet="template(); context: ctx" />
        }
      </div>
    </div>
  `, styles: [":host{display:block;height:100%;min-height:0}.preview{height:100%;overflow:auto;background:var(--ds-canvas-bg)}.preview__stage{box-sizing:border-box;max-width:880px;min-height:240px;margin:32px auto;padding:24px;color:var(--ds-text);background:var(--ds-card-bg);border:1px solid var(--ds-card-border);border-radius:var(--ds-radius);box-shadow:var(--ds-card-shadow)}\n"] }]
        }], propDecorators: { template: [{ type: i0.Input, args: [{ isSignal: true, alias: "template", required: true }] }] } });

class StudioPreviewDirective {
    template = inject(TemplateRef);
    // The guard's parameters exist only to shape the template's type; neither is read at runtime.
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    static ngTemplateContextGuard(_directive, context) {
        return true;
    }
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "20.3.33", ngImport: i0, type: StudioPreviewDirective, deps: [], target: i0.ɵɵFactoryTarget.Directive });
    static ɵdir = i0.ɵɵngDeclareDirective({ minVersion: "14.0.0", version: "20.3.33", type: StudioPreviewDirective, isStandalone: true, selector: "ng-template[dsStudioPreview]", ngImport: i0 });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "20.3.33", ngImport: i0, type: StudioPreviewDirective, decorators: [{
            type: Directive,
            args: [{ selector: 'ng-template[dsStudioPreview]', standalone: true }]
        }] });

class NgxStudioComponent {
    #facade = inject(StudioFacade);
    #views = inject(StudioViews);
    theme = inject(StudioTheme);
    studio = input.required(...(ngDevMode ? [{ debugName: "studio" }] : []));
    adapters = input({}, ...(ngDevMode ? [{ debugName: "adapters" }] : []));
    previewSlot = contentChild(StudioPreviewDirective, ...(ngDevMode ? [{ debugName: "previewSlot" }] : []));
    paletteComponents = computed(() => this.studio().getComponents(), ...(ngDevMode ? [{ debugName: "paletteComponents" }] : []));
    view = this.#views.current;
    inspecting = computed(() => this.#facade.inspectedId() !== null && this.view() === 'canvas', ...(ngDevMode ? [{ debugName: "inspecting" }] : []));
    picking = this.#facade.picking;
    constructor() {
        effect(() => {
            this.#views.adapters.set(this.adapters());
            this.#views.hasPreview.set(!!this.previewSlot());
        });
    }
    ngOnInit() {
        this.#facade.bind(this.studio());
    }
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "20.3.33", ngImport: i0, type: NgxStudioComponent, deps: [], target: i0.ɵɵFactoryTarget.Component });
    static ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "17.0.0", version: "20.3.33", type: NgxStudioComponent, isStandalone: true, selector: "ds-ngx-studio", inputs: { studio: { classPropertyName: "studio", publicName: "studio", isSignal: true, isRequired: true, transformFunction: null }, adapters: { classPropertyName: "adapters", publicName: "adapters", isSignal: true, isRequired: false, transformFunction: null } }, host: { properties: { "class.ds-studio--inspecting": "inspecting()", "class.ds-studio--focus": "view() !== 'canvas'", "class.ds-studio--picking": "picking()", "attr.data-theme": "theme.resolved()" } }, providers: [StudioFacade, StudioViews], queries: [{ propertyName: "previewSlot", first: true, predicate: StudioPreviewDirective, descendants: true, isSignal: true }], ngImport: i0, template: `
    <ds-studio-header />
    <ds-canvas-palette [components]="paletteComponents()" />
    @switch (view()) {
      @case ('ast') {
        <ds-ast-view />
      }
      @case ('adapter') {
        <ds-adapter-view />
      }
      @case ('preview') {
        @if (previewSlot(); as slot) {
          <ds-preview-view [template]="slot.template" />
        }
      }
      @default {
        <ds-canvas />
      }
    }
    @if (inspecting()) {
      <ds-inspector />
    }
    @if (picking()) {
      <div class="ds-pick-hint" role="status">
        <span class="material-icons" aria-hidden="true">ads_click</span>
        Click a component on the canvas to link it · <kbd>Esc</kbd> to cancel
      </div>
    }
  `, isInline: true, styles: ["@import\"https://fonts.googleapis.com/icon?family=Material+Icons\";:host{display:grid;grid-template-columns:260px minmax(0,1fr) 0px;grid-template-rows:auto minmax(0,1fr);transition:grid-template-columns .32s cubic-bezier(.2,.8,.2,1);height:100%;min-height:480px;overflow:hidden;position:relative;color:var(--ds-text);container-type:inline-size;container-name:ds-studio;font-family:Inter,Roboto,system-ui,-apple-system,sans-serif;--ds-accent: #6366f1;--ds-accent-soft: rgba(99, 102, 241, .1);--ds-accent-ring: rgba(99, 102, 241, .28);--ds-text: #111827;--ds-text-muted: #6b7280;--ds-border: rgba(16, 24, 40, .08);--ds-border-dashed: rgba(99, 102, 241, .28);--ds-radius: 12px;--ds-radius-sm: 10px;--ds-canvas-bg: #f4f6fa;--ds-grid-dot: rgba(16, 24, 40, .08);--ds-card-bg: #ffffff;--ds-card-bg-container: #fafbfd;--ds-card-border: rgba(16, 24, 40, .08);--ds-card-shadow: 0 1px 2px rgba(16, 24, 40, .06), 0 1px 3px rgba(16, 24, 40, .04);--ds-card-shadow-hover: 0 4px 12px rgba(16, 24, 40, .08), 0 2px 4px rgba(16, 24, 40, .04);--ds-chip-bg: rgba(16, 24, 40, .04);--ds-chip-bg-hover: rgba(16, 24, 40, .08);--ds-code-key: #4f46e5;--ds-code-string: #047857;--ds-code-number: #b45309;--ds-code-keyword: #be185d;--ds-code-punctuation: #6b7280;--ds-code-error: #dc2626;--ds-dropzone-bg: rgba(16, 24, 40, .02);--ds-dropzone-bg-active: rgba(99, 102, 241, .06);--ds-sidebar-bg: #ffffff;--ds-hover: rgba(16, 24, 40, .04);--ds-active: rgba(99, 102, 241, .1);--ds-folder: var(--ds-accent);--ds-input-bg: rgba(16, 24, 40, .04);--mat-sys-primary: #6366f1;--mat-sys-on-primary: #ffffff;--mat-sys-primary-container: #e0e7ff;--mat-sys-on-primary-container: #312e81;--mat-sys-surface-tint: #6366f1}ds-studio-header{grid-column:1/-1;grid-row:1}@media(min-width:1200px){:host(.ds-studio--inspecting){grid-template-columns:260px minmax(0,1fr) 360px}}:host(.ds-studio--focus){grid-template-columns:0px minmax(0,1fr) 0px}:host(.ds-studio--focus) ds-canvas-palette{visibility:hidden;transition:visibility 0s .32s}:host ::ng-deep .mat-mdc-form-field-hint,:host ::ng-deep .mat-mdc-form-field-bottom-align:before{color:var(--ds-text-muted)}:host ::ng-deep *{scrollbar-width:thin;scrollbar-color:var(--ds-border) transparent}:host ::ng-deep *::-webkit-scrollbar{width:4px;height:4px}:host ::ng-deep *::-webkit-scrollbar-track{background:transparent}:host ::ng-deep *::-webkit-scrollbar-thumb{background:var(--ds-border);border-radius:999px}:host ::ng-deep *::-webkit-scrollbar-thumb:hover{background:var(--ds-text-muted)}:host([data-theme=dark]){color-scheme:dark;--ds-canvas-bg: #0b0e14;--ds-card-bg: #171a24;--ds-card-bg-container: #12151e;--ds-card-border: rgba(255, 255, 255, .08);--ds-card-shadow: 0 1px 2px rgba(0, 0, 0, .4);--ds-card-shadow-hover: 0 8px 24px rgba(0, 0, 0, .5);--ds-text: #e5e7eb;--ds-text-muted: #9ca3af;--ds-border: rgba(255, 255, 255, .08);--ds-chip-bg: rgba(255, 255, 255, .05);--ds-chip-bg-hover: rgba(255, 255, 255, .08);--ds-code-key: #a5b4fc;--ds-code-string: #6ee7b7;--ds-code-number: #fbbf24;--ds-code-keyword: #f9a8d4;--ds-code-punctuation: #9ca3af;--ds-code-error: #f87171;--ds-dropzone-bg: rgba(255, 255, 255, .02);--ds-dropzone-bg-active: rgba(99, 102, 241, .12);--ds-grid-dot: rgba(255, 255, 255, .07);--ds-sidebar-bg: #141821;--ds-hover: rgba(255, 255, 255, .05);--ds-active: rgba(99, 102, 241, .15);--ds-input-bg: rgba(255, 255, 255, .05);--mat-sys-surface: #141821;--mat-sys-surface-bright: #1a1f2b;--mat-sys-surface-container-lowest: #0b0e14;--mat-sys-surface-container-low: #12151e;--mat-sys-surface-container: #171b25;--mat-sys-surface-container-high: #1d2130;--mat-sys-surface-container-highest: #22273a;--mat-sys-surface-variant: #2a2f3f;--mat-sys-surface-dim: #0b0e14;--mat-sys-surface-tint: #6366f1;--mat-sys-background: #141821;--mat-sys-on-surface: #e5e7eb;--mat-sys-on-surface-variant: #9ca3af;--mat-sys-on-background: #e5e7eb;--mat-sys-outline: #4b5563;--mat-sys-outline-variant: rgba(255, 255, 255, .12);--mat-sys-primary: #a5b4fc;--mat-sys-on-primary: #1e1b4b;--mat-sys-primary-container: #4338ca;--mat-sys-on-primary-container: #e0e7ff;--mat-sys-primary-fixed: #e0e7ff;--mat-sys-primary-fixed-dim: #a5b4fc;--mat-sys-inverse-primary: #4f46e5;--mat-sys-secondary: #c7d2fe;--mat-sys-on-secondary: #312e81;--mat-sys-secondary-container: #3730a3;--mat-sys-on-secondary-container: #e0e7ff;--mat-sys-error: #f87171;--mat-sys-on-error: #450a0a;--mat-sys-error-container: #7f1d1d;--mat-sys-on-error-container: #fecaca;--mat-sys-inverse-surface: #e5e7eb;--mat-sys-inverse-on-surface: #141821;--mat-sys-shadow: #000000;--mat-sys-scrim: #000000}::ng-deep .cdk-overlay-container[data-ds-theme=dark]{color-scheme:dark;--mat-sys-surface: #141821;--mat-sys-surface-bright: #1a1f2b;--mat-sys-surface-container-lowest: #0b0e14;--mat-sys-surface-container-low: #12151e;--mat-sys-surface-container: #171b25;--mat-sys-surface-container-high: #1d2130;--mat-sys-surface-container-highest: #22273a;--mat-sys-surface-variant: #2a2f3f;--mat-sys-surface-dim: #0b0e14;--mat-sys-surface-tint: #6366f1;--mat-sys-background: #141821;--mat-sys-on-surface: #e5e7eb;--mat-sys-on-surface-variant: #9ca3af;--mat-sys-on-background: #e5e7eb;--mat-sys-outline: #4b5563;--mat-sys-outline-variant: rgba(255, 255, 255, .12);--mat-sys-primary: #a5b4fc;--mat-sys-on-primary: #1e1b4b;--mat-sys-primary-container: #4338ca;--mat-sys-on-primary-container: #e0e7ff;--mat-sys-primary-fixed: #e0e7ff;--mat-sys-primary-fixed-dim: #a5b4fc;--mat-sys-inverse-primary: #4f46e5;--mat-sys-secondary: #c7d2fe;--mat-sys-on-secondary: #312e81;--mat-sys-secondary-container: #3730a3;--mat-sys-on-secondary-container: #e0e7ff;--mat-sys-error: #f87171;--mat-sys-on-error: #450a0a;--mat-sys-error-container: #7f1d1d;--mat-sys-on-error-container: #fecaca;--mat-sys-inverse-surface: #e5e7eb;--mat-sys-inverse-on-surface: #141821;--mat-sys-shadow: #000000;--mat-sys-scrim: #000000}.ds-pick-hint{position:absolute;left:50%;bottom:24px;transform:translate(-50%);z-index:40;display:inline-flex;align-items:center;gap:8px;padding:10px 16px;border-radius:999px;background:var(--ds-accent);color:#fff;font-size:.85rem;font-weight:600;box-shadow:0 10px 30px #10182840}.ds-pick-hint .material-icons{font-size:18px}.ds-pick-hint kbd{padding:1px 6px;border-radius:4px;background:#ffffff40;font:inherit}\n"], dependencies: [{ kind: "component", type: StudioHeaderComponent, selector: "ds-studio-header" }, { kind: "component", type: CanvasPaletteComponent, selector: "ds-canvas-palette", inputs: ["components"] }, { kind: "component", type: CanvasComponent, selector: "ds-canvas" }, { kind: "component", type: InspectorComponent, selector: "ds-inspector" }, { kind: "component", type: AstViewComponent, selector: "ds-ast-view" }, { kind: "component", type: AdapterViewComponent, selector: "ds-adapter-view" }, { kind: "component", type: PreviewViewComponent, selector: "ds-preview-view", inputs: ["template"] }], changeDetection: i0.ChangeDetectionStrategy.OnPush });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "20.3.33", ngImport: i0, type: NgxStudioComponent, decorators: [{
            type: Component,
            args: [{ selector: 'ds-ngx-studio', standalone: true, providers: [StudioFacade, StudioViews], imports: [
                        StudioHeaderComponent,
                        CanvasPaletteComponent,
                        CanvasComponent,
                        InspectorComponent,
                        AstViewComponent,
                        AdapterViewComponent,
                        PreviewViewComponent
                    ], changeDetection: ChangeDetectionStrategy.OnPush, host: {
                        '[class.ds-studio--inspecting]': 'inspecting()',
                        '[class.ds-studio--focus]': "view() !== 'canvas'",
                        '[class.ds-studio--picking]': 'picking()',
                        '[attr.data-theme]': 'theme.resolved()'
                    }, template: `
    <ds-studio-header />
    <ds-canvas-palette [components]="paletteComponents()" />
    @switch (view()) {
      @case ('ast') {
        <ds-ast-view />
      }
      @case ('adapter') {
        <ds-adapter-view />
      }
      @case ('preview') {
        @if (previewSlot(); as slot) {
          <ds-preview-view [template]="slot.template" />
        }
      }
      @default {
        <ds-canvas />
      }
    }
    @if (inspecting()) {
      <ds-inspector />
    }
    @if (picking()) {
      <div class="ds-pick-hint" role="status">
        <span class="material-icons" aria-hidden="true">ads_click</span>
        Click a component on the canvas to link it · <kbd>Esc</kbd> to cancel
      </div>
    }
  `, styles: ["@import\"https://fonts.googleapis.com/icon?family=Material+Icons\";:host{display:grid;grid-template-columns:260px minmax(0,1fr) 0px;grid-template-rows:auto minmax(0,1fr);transition:grid-template-columns .32s cubic-bezier(.2,.8,.2,1);height:100%;min-height:480px;overflow:hidden;position:relative;color:var(--ds-text);container-type:inline-size;container-name:ds-studio;font-family:Inter,Roboto,system-ui,-apple-system,sans-serif;--ds-accent: #6366f1;--ds-accent-soft: rgba(99, 102, 241, .1);--ds-accent-ring: rgba(99, 102, 241, .28);--ds-text: #111827;--ds-text-muted: #6b7280;--ds-border: rgba(16, 24, 40, .08);--ds-border-dashed: rgba(99, 102, 241, .28);--ds-radius: 12px;--ds-radius-sm: 10px;--ds-canvas-bg: #f4f6fa;--ds-grid-dot: rgba(16, 24, 40, .08);--ds-card-bg: #ffffff;--ds-card-bg-container: #fafbfd;--ds-card-border: rgba(16, 24, 40, .08);--ds-card-shadow: 0 1px 2px rgba(16, 24, 40, .06), 0 1px 3px rgba(16, 24, 40, .04);--ds-card-shadow-hover: 0 4px 12px rgba(16, 24, 40, .08), 0 2px 4px rgba(16, 24, 40, .04);--ds-chip-bg: rgba(16, 24, 40, .04);--ds-chip-bg-hover: rgba(16, 24, 40, .08);--ds-code-key: #4f46e5;--ds-code-string: #047857;--ds-code-number: #b45309;--ds-code-keyword: #be185d;--ds-code-punctuation: #6b7280;--ds-code-error: #dc2626;--ds-dropzone-bg: rgba(16, 24, 40, .02);--ds-dropzone-bg-active: rgba(99, 102, 241, .06);--ds-sidebar-bg: #ffffff;--ds-hover: rgba(16, 24, 40, .04);--ds-active: rgba(99, 102, 241, .1);--ds-folder: var(--ds-accent);--ds-input-bg: rgba(16, 24, 40, .04);--mat-sys-primary: #6366f1;--mat-sys-on-primary: #ffffff;--mat-sys-primary-container: #e0e7ff;--mat-sys-on-primary-container: #312e81;--mat-sys-surface-tint: #6366f1}ds-studio-header{grid-column:1/-1;grid-row:1}@media(min-width:1200px){:host(.ds-studio--inspecting){grid-template-columns:260px minmax(0,1fr) 360px}}:host(.ds-studio--focus){grid-template-columns:0px minmax(0,1fr) 0px}:host(.ds-studio--focus) ds-canvas-palette{visibility:hidden;transition:visibility 0s .32s}:host ::ng-deep .mat-mdc-form-field-hint,:host ::ng-deep .mat-mdc-form-field-bottom-align:before{color:var(--ds-text-muted)}:host ::ng-deep *{scrollbar-width:thin;scrollbar-color:var(--ds-border) transparent}:host ::ng-deep *::-webkit-scrollbar{width:4px;height:4px}:host ::ng-deep *::-webkit-scrollbar-track{background:transparent}:host ::ng-deep *::-webkit-scrollbar-thumb{background:var(--ds-border);border-radius:999px}:host ::ng-deep *::-webkit-scrollbar-thumb:hover{background:var(--ds-text-muted)}:host([data-theme=dark]){color-scheme:dark;--ds-canvas-bg: #0b0e14;--ds-card-bg: #171a24;--ds-card-bg-container: #12151e;--ds-card-border: rgba(255, 255, 255, .08);--ds-card-shadow: 0 1px 2px rgba(0, 0, 0, .4);--ds-card-shadow-hover: 0 8px 24px rgba(0, 0, 0, .5);--ds-text: #e5e7eb;--ds-text-muted: #9ca3af;--ds-border: rgba(255, 255, 255, .08);--ds-chip-bg: rgba(255, 255, 255, .05);--ds-chip-bg-hover: rgba(255, 255, 255, .08);--ds-code-key: #a5b4fc;--ds-code-string: #6ee7b7;--ds-code-number: #fbbf24;--ds-code-keyword: #f9a8d4;--ds-code-punctuation: #9ca3af;--ds-code-error: #f87171;--ds-dropzone-bg: rgba(255, 255, 255, .02);--ds-dropzone-bg-active: rgba(99, 102, 241, .12);--ds-grid-dot: rgba(255, 255, 255, .07);--ds-sidebar-bg: #141821;--ds-hover: rgba(255, 255, 255, .05);--ds-active: rgba(99, 102, 241, .15);--ds-input-bg: rgba(255, 255, 255, .05);--mat-sys-surface: #141821;--mat-sys-surface-bright: #1a1f2b;--mat-sys-surface-container-lowest: #0b0e14;--mat-sys-surface-container-low: #12151e;--mat-sys-surface-container: #171b25;--mat-sys-surface-container-high: #1d2130;--mat-sys-surface-container-highest: #22273a;--mat-sys-surface-variant: #2a2f3f;--mat-sys-surface-dim: #0b0e14;--mat-sys-surface-tint: #6366f1;--mat-sys-background: #141821;--mat-sys-on-surface: #e5e7eb;--mat-sys-on-surface-variant: #9ca3af;--mat-sys-on-background: #e5e7eb;--mat-sys-outline: #4b5563;--mat-sys-outline-variant: rgba(255, 255, 255, .12);--mat-sys-primary: #a5b4fc;--mat-sys-on-primary: #1e1b4b;--mat-sys-primary-container: #4338ca;--mat-sys-on-primary-container: #e0e7ff;--mat-sys-primary-fixed: #e0e7ff;--mat-sys-primary-fixed-dim: #a5b4fc;--mat-sys-inverse-primary: #4f46e5;--mat-sys-secondary: #c7d2fe;--mat-sys-on-secondary: #312e81;--mat-sys-secondary-container: #3730a3;--mat-sys-on-secondary-container: #e0e7ff;--mat-sys-error: #f87171;--mat-sys-on-error: #450a0a;--mat-sys-error-container: #7f1d1d;--mat-sys-on-error-container: #fecaca;--mat-sys-inverse-surface: #e5e7eb;--mat-sys-inverse-on-surface: #141821;--mat-sys-shadow: #000000;--mat-sys-scrim: #000000}::ng-deep .cdk-overlay-container[data-ds-theme=dark]{color-scheme:dark;--mat-sys-surface: #141821;--mat-sys-surface-bright: #1a1f2b;--mat-sys-surface-container-lowest: #0b0e14;--mat-sys-surface-container-low: #12151e;--mat-sys-surface-container: #171b25;--mat-sys-surface-container-high: #1d2130;--mat-sys-surface-container-highest: #22273a;--mat-sys-surface-variant: #2a2f3f;--mat-sys-surface-dim: #0b0e14;--mat-sys-surface-tint: #6366f1;--mat-sys-background: #141821;--mat-sys-on-surface: #e5e7eb;--mat-sys-on-surface-variant: #9ca3af;--mat-sys-on-background: #e5e7eb;--mat-sys-outline: #4b5563;--mat-sys-outline-variant: rgba(255, 255, 255, .12);--mat-sys-primary: #a5b4fc;--mat-sys-on-primary: #1e1b4b;--mat-sys-primary-container: #4338ca;--mat-sys-on-primary-container: #e0e7ff;--mat-sys-primary-fixed: #e0e7ff;--mat-sys-primary-fixed-dim: #a5b4fc;--mat-sys-inverse-primary: #4f46e5;--mat-sys-secondary: #c7d2fe;--mat-sys-on-secondary: #312e81;--mat-sys-secondary-container: #3730a3;--mat-sys-on-secondary-container: #e0e7ff;--mat-sys-error: #f87171;--mat-sys-on-error: #450a0a;--mat-sys-error-container: #7f1d1d;--mat-sys-on-error-container: #fecaca;--mat-sys-inverse-surface: #e5e7eb;--mat-sys-inverse-on-surface: #141821;--mat-sys-shadow: #000000;--mat-sys-scrim: #000000}.ds-pick-hint{position:absolute;left:50%;bottom:24px;transform:translate(-50%);z-index:40;display:inline-flex;align-items:center;gap:8px;padding:10px 16px;border-radius:999px;background:var(--ds-accent);color:#fff;font-size:.85rem;font-weight:600;box-shadow:0 10px 30px #10182840}.ds-pick-hint .material-icons{font-size:18px}.ds-pick-hint kbd{padding:1px 6px;border-radius:4px;background:#ffffff40;font:inherit}\n"] }]
        }], ctorParameters: () => [], propDecorators: { studio: [{ type: i0.Input, args: [{ isSignal: true, alias: "studio", required: true }] }], adapters: [{ type: i0.Input, args: [{ isSignal: true, alias: "adapters", required: false }] }], previewSlot: [{ type: i0.ContentChild, args: [i0.forwardRef(() => StudioPreviewDirective), { isSignal: true }] }] } });

/**
 * Generated bundle index. Do not edit.
 */

export { CanvasComponent, CanvasNodeComponent, CanvasPaletteComponent, CheckboxFieldComponent, DecimalFieldComponent, DsSortableDirective, EnumFieldComponent, FieldHostComponent, InspectorComponent, MetaFieldsComponent, NgxStudioComponent, PropsFormComponent, SelectFieldComponent, StudioHeaderComponent, StudioPreviewDirective, StudioTheme, StudioViews, TextFieldComponent, ThemeToggleComponent, ViewSwitcherComponent };
//# sourceMappingURL=dynamic-ui-ngx-studio.mjs.map
