import {Component, OnInit, Input, Output, ElementRef} from '@angular/core';
import {Node, TreeTableNode, Options, SearchableNode} from '../models';
import {SelectionModel} from '@angular/cdk/collections';
import {TreeService} from '../services/tree/tree.service';
import {MatTableDataSource} from '@angular/material/table';
import {ValidatorService} from '../services/validator/validator.service';
import {ConverterService} from '../services/converter/converter.service';
import {defaultOptions} from '../default.options';
import {flatMap, defaults} from 'lodash-es';
import {Subject} from 'rxjs';

@Component({
  selector: 'app-tree-table',
  templateUrl: './tree-table.component.html',
  styleUrls: ['./tree-table.component.scss']
})
export class TreeTableComponent<T> implements OnInit {
  @Input() tree: Node<T> | Node<T>[];
  @Input() options: Options<T> = {};
  @Input() type: 'price' | 'free';
  @Output() nodeClicked: Subject<TreeTableNode<T>> = new Subject();
  private searchableTree: SearchableNode<T>[];
  treeTable: TreeTableNode<T>[];
  displayedColumns: string[];
  dataSource: MatTableDataSource<TreeTableNode<T>>;
  selection = new SelectionModel<any>(true, []);

  /** Whether the number of selected elements matches the total number of rows. */
  isAllSelected() {
    const numSelected = this.selection.selected.length;
    const numRows = this.dataSource.data.length;
    return numSelected === numRows;
  }

  constructor(
    private treeService: TreeService,
    private validatorService: ValidatorService,
    private converterService: ConverterService) {
  }

  /** Selects all rows if they are not all selected; otherwise clear selection. */
  masterToggle() {
    if (this.isAllSelected()) {
      this.dataSource.data.forEach(item => {
        item.dto.price = item.dto.oldPrice;
        item.children.forEach(i => {
          i.dto.price = i.dto.oldPrice;
        });
      });
      this.selection.clear();
      return;
    }
    this.dataSource.data.forEach(item => {
      item.dto.price = 0;
      item.children.forEach(i => {
        i.dto.price = 0;
      });
    });
    this.selection.select(...this.dataSource.data);
  }

  /** The label for the checkbox on the passed row */
  checkboxLabel(row?: any): string {
    if (!row) {
      return `${this.isAllSelected() ? 'deselect' : 'select'} all`;
    }
    return `${this.selection.isSelected(row) ? 'deselect' : 'select'} row ${row.position + 1}`;
  }

  isSelected(items, item) {
    const selected = items.filter(i => {
      return i.id === item.id;
    }).length > 0;
    return selected;
  }

  parentsCheck() {
    this.dataSource.data.forEach(item => {
      console.log(item);
      if (item.children.length > 0) {
        let hasSelected = false;
        let allDeselected = true;
        item.children.forEach(son => {
          if (this.selection.isSelected(son)) {
            allDeselected = false;
            hasSelected = true;
          }
        });
        if (hasSelected) {
          this.selection.select(item);
        }
        if (allDeselected) {
          this.selection.deselect(item);
        }
      }
    });
  }

  selected(element) {
    this.selection.toggle(element);
    const isSelected = this.isSelected(this.selection.selected, element);
    if (isSelected) {
      if (element.children.length > 0) {
        element.children.forEach(item => {
          this.selection.select(item);
          item.dto.price = 0;
        });
      } else {
        element.dto.price = 0;
      }
    } else {
      if (element.children.length > 0) {
        element.children.forEach(item => {
          this.selection.deselect(item);
          item.dto.price = item.dto.oldPrice;
        });
      } else {
        element.dto.price = element.dto.oldPrice;
      }
    }
    this.parentsCheck();
    this.dataSource.data = [...this.dataSource.data];
  }

  ngOnInit(): void {
    this.tree = Array.isArray(this.tree) ? this.tree : [this.tree];
    this.options = this.parseOptions(defaultOptions);
    const customOrderValidator = this.validatorService.validateCustomOrder(
      (this.tree[0] as unknown) as Node<{ [x: string]: {} }>,
      this.options.customColumnOrder
    );
    if (this.options.customColumnOrder && !customOrderValidator.valid) {
      throw new Error(`
        Properties ${customOrderValidator.xor.map(x => `'${x}'`).join(', ')} incorrect or missing in customColumnOrder`
      );
    }
    this.displayedColumns = this.options.customColumnOrder
      ? this.options.customColumnOrder
      : this.extractNodeProps(this.tree[0]);
    console.log(this.displayedColumns);
    this.searchableTree = this.tree.map(t => this.converterService.toSearchableTree(t));
    const treeTableTree = this.searchableTree.map(st => this.converterService.toTreeTableTree(st));
    this.treeTable = flatMap(treeTableTree, this.treeService.flatten);
    this.dataSource = this.generateDataSource();
  }

  extractNodeProps(tree: Node<T> & { value: { [k: string]: any } }): string[] {
    return Object.keys(tree.value).filter(x => typeof tree.value[x] !== 'object');
  }

  generateDataSource(): MatTableDataSource<TreeTableNode<T>> {
    return new MatTableDataSource(this.treeTable.filter(x => x.isVisible));
  }

  formatIndentation(node: TreeTableNode<T>, step: number = 5): string {
    return '&nbsp;'.repeat(node.depth * step);
  }

  formatElevation(): string {
    return `mat-elevation-z${this.options.elevation}`;
  }

  getChildrenPrice(children) {
    let total = 0;
    children.forEach(item => {
      total = total + Number(item.dto.price);
    });
    return total;
  }

  getChildrenOPrice(children) {
    let total = 0;
    children.forEach(item => {
      total = total + Number(item.dto.oldPrice);
    });
    return total;
  }

  onNodeClick(clickedNode): void {
    clickedNode.isExpanded = !clickedNode.isExpanded;
    this.treeTable.forEach(el => {
      el.isVisible = this.searchableTree.every(st => {
        return this.treeService.searchById(st, el.id).fold([], n => n.pathToRoot)
        .every(p => this.treeTable.find(x => x.id === p.id).isExpanded);
      });
    });
    this.dataSource = this.generateDataSource();
    this.nodeClicked.next(clickedNode);
  }

  // Overrides default options with those specified by the user
  parseOptions(defaultOpts: Options<T>): Options<T> {
    return defaults(this.options, defaultOpts);
  }

}
