import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';
import { NgFor, NgIf } from '@angular/common';
import { PromptItem } from './prompts-panel.types';

@Component({
  standalone: true,
  selector: 'app-prompts-panel',
  templateUrl: './prompts-panel.component.html',
  styleUrl: './prompts-panel.component.scss',
  imports: [],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PromptsPanelComponent {
  @Input() prompts: PromptItem[] = [];
  @Output() select = new EventEmitter<PromptItem>();

  onSelect(item: PromptItem) {
    this.select.emit(item);
  }
}
