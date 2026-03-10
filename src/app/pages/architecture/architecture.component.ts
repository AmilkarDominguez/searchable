import { Component, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';

interface TabItem {
  id: string;
  label: string;
}

interface Metric {
  label: string;
  value: number;
  max: number;
  color: string;
}

interface ProCon {
  type: 'pro' | 'con' | 'warn';
  text: string;
}

interface KVData {
  label: string;
  value: string;
}

interface TabDescription {
  title: string;
  icon: string;
  text: string;
  highlight: string;
}

interface DetailData {
  metrics: Metric[];
  proscons: ProCon[];
  kvdata: KVData[];
  usecases: string[];
  decision: string;
}

interface RoadmapItem {
  phase: string;
  time: string;
  desc: string;
  color: string;
}

interface CompScenario {
  scenario: string;
  fallback: { result: string; latency: string; quality: string };
  rrf: { result: string; latency: string; quality: string };
  hybrid: { result: string; latency: string; quality: string };
  winner: string;
}

@Component({
  selector: 'app-architecture',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="hsa-root">
      <!-- Header -->
      <div class="hsa-container">
        <h1 class="hsa-title">Hybrid Search Architecture</h1>
        <p class="hsa-subtitle">Deterministic DSL + Semantic KNN — Elasticsearch</p>

        <!-- Tabs -->
        <div class="hsa-tabs">
          @for (tab of tabs; track tab.id) {
            <button
              class="hsa-tab"
              [class.hsa-tab--active]="activeTab() === tab.id"
              (click)="setActiveTab(tab.id)"
            >{{ tab.label }}</button>
          }
        </div>

        <!-- Comparison Tab -->
        @if (activeTab() === 'comparison') {
          <div class="hsa-stack">
            <!-- Strategy Comparison Table -->
            <div class="hsa-card" style="border-left-color: #22d3ee">
              <h4 class="hsa-card__title" style="color: #22d3ee">Strategy Comparison</h4>
              <div class="hsa-table-wrap">
                <table class="hsa-table">
                  <thead>
                    <tr>
                      <th class="hsa-table__th">Dimension</th>
                      @for (s of compStrategies; track s.name) {
                        <th class="hsa-table__th hsa-table__th--center" [style.color]="s.color">{{ s.name }}</th>
                      }
                    </tr>
                  </thead>
                  <tbody>
                    @for (dim of compDimensions; track dim.label) {
                      <tr>
                        <td class="hsa-table__td">{{ dim.label }}</td>
                        @for (v of dim.values; track $index) {
                          <td class="hsa-table__td hsa-table__td--center">
                            <div class="hsa-dots">
                              @for (dot of [1,2,3,4,5]; track dot) {
                                <div
                                  class="hsa-dot"
                                  [style.background]="dot <= v ? compStrategies[$index].color : '#2a3a52'"
                                  [style.opacity]="dot <= v ? 1 : 0.3"
                                ></div>
                              }
                            </div>
                          </td>
                        }
                      </tr>
                    }
                  </tbody>
                </table>
              </div>
            </div>

            <!-- Real Query Scenarios -->
            <div class="hsa-card" style="border-left-color: #a78bfa">
              <h4 class="hsa-card__title" style="color: #a78bfa">Real Query Scenarios</h4>
              <p class="hsa-hint">How each strategy handles different search types you likely receive. Click to expand.</p>
              @for (s of compScenarios; track s.scenario; let i = $index) {
                <div
                  class="hsa-scenario"
                  [class.hsa-scenario--expanded]="expandedScenario() === i"
                  (click)="toggleScenario(i)"
                >
                  <div class="hsa-scenario__header">
                    <div>
                      <span class="hsa-scenario__query">{{ s.scenario }}</span>
                      <span class="hsa-scenario__winner">→ {{ s.winner }}</span>
                    </div>
                    <span class="hsa-scenario__chevron" [class.hsa-scenario__chevron--open]="expandedScenario() === i">▼</span>
                  </div>
                  @if (expandedScenario() === i) {
                    <div class="hsa-scenario__grid">
                      @for (col of getScenarioCols(s); track col.label) {
                        <div class="hsa-scenario__col" [style.border-top-color]="col.color">
                          <div class="hsa-scenario__col-label" [style.color]="col.color">{{ col.label }}</div>
                          <div class="hsa-scenario__col-result">{{ col.data.result }}</div>
                          <div class="hsa-scenario__col-row">
                            <span class="hsa-scenario__col-dim">Latency</span>
                            <span class="hsa-scenario__col-val">{{ col.data.latency }}</span>
                          </div>
                          <div class="hsa-scenario__col-row">
                            <span class="hsa-scenario__col-dim">Quality</span>
                            <span class="hsa-scenario__col-quality" [style.color]="getQualityColor(col.data.quality)">{{ col.data.quality }}</span>
                          </div>
                        </div>
                      }
                    </div>
                  }
                </div>
              }
            </div>

            <!-- Decision Tree -->
            <div class="hsa-card" style="border-left-color: #34d399">
              <h4 class="hsa-card__title" style="color: #34d399">Decision Tree</h4>
              @for (item of decisionTree; track item.q) {
                <div class="hsa-dtree-item">
                  <div class="hsa-dtree-q">{{ item.q }}</div>
                  <div class="hsa-dtree-ans"><span class="hsa-dtree-yes">Yes</span> {{ item.yes }}</div>
                  <div class="hsa-dtree-ans"><span class="hsa-dtree-no">No</span> {{ item.no }}</div>
                </div>
              }
            </div>

            <!-- When to use what -->
            <div class="hsa-card" style="border-left-color: #f59e0b">
              <h4 class="hsa-card__title" style="color: #f59e0b">Summary: When to Use What</h4>
              @for (item of whenToUse; track item.strategy) {
                <div class="hsa-when" [style.border-left-color]="item.color">
                  <div class="hsa-when__header">
                    <span class="hsa-when__name" [style.color]="item.color">{{ item.strategy }}</span>
                    <div class="hsa-when__badges">
                      <span class="hsa-when__effort">{{ item.effort }}</span>
                      <span class="hsa-when__risk" [style.background]="getRiskBg(item.risk)" [style.color]="getRiskColor(item.risk)">Risk: {{ item.risk }}</span>
                    </div>
                  </div>
                  <p class="hsa-when__desc">{{ item.when }}</p>
                </div>
              }
            </div>
          </div>
        } @else {
          <!-- Diagram -->
          <div class="hsa-diagram" [innerHTML]="currentDiagram()"></div>

          <!-- Description -->
          @if (currentDescription(); as desc) {
            <div class="hsa-desc">
              <div class="hsa-desc__bar"></div>
              <div class="hsa-desc__content">
                <span class="hsa-desc__icon">{{ desc.icon }}</span>
                <div class="hsa-desc__body">
                  <h3 class="hsa-desc__title">{{ desc.title }}</h3>
                  <p class="hsa-desc__text">{{ desc.text }}</p>
                  <div class="hsa-desc__highlight">{{ desc.highlight }}</div>
                </div>
              </div>
            </div>
          }

          <!-- Detail Panels -->
          @if (currentDetail(); as detail) {
            <!-- Metrics + Key Data -->
            <div class="hsa-grid-2">
              <div class="hsa-card" style="border-left-color: #22d3ee">
                <h4 class="hsa-card__title" style="color: #22d3ee">Metrics</h4>
                @for (m of detail.metrics; track m.label) {
                  <div class="hsa-metric">
                    <div class="hsa-metric__header">
                      <span class="hsa-metric__label">{{ m.label }}</span>
                      <span class="hsa-metric__value" [style.color]="m.color">{{ m.value }}/{{ m.max }}</span>
                    </div>
                    <div class="hsa-metric__track">
                      <div class="hsa-metric__fill" [style.width.%]="(m.value / m.max) * 100" [style.background]="m.color"></div>
                    </div>
                  </div>
                }
              </div>
              <div class="hsa-card" style="border-left-color: #a78bfa">
                <h4 class="hsa-card__title" style="color: #a78bfa">Key Data</h4>
                @for (kv of detail.kvdata; track kv.label) {
                  <div class="hsa-kv">
                    <span class="hsa-kv__label">{{ kv.label }}</span>
                    <span class="hsa-kv__value">{{ kv.value }}</span>
                  </div>
                }
              </div>
            </div>

            <!-- Pros/Cons + Use Cases + Decision -->
            <div class="hsa-grid-2">
              <div class="hsa-card" style="border-left-color: #34d399">
                <h4 class="hsa-card__title" style="color: #34d399">Pros &amp; Cons</h4>
                @for (item of detail.proscons; track $index) {
                  <div class="hsa-procon">
                    <span class="hsa-procon__icon" [class.hsa-procon__icon--pro]="item.type === 'pro'" [class.hsa-procon__icon--con]="item.type === 'con'" [class.hsa-procon__icon--warn]="item.type === 'warn'">
                      {{ item.type === 'pro' ? '✓' : item.type === 'con' ? '✗' : '⚠' }}
                    </span>
                    <span class="hsa-procon__text">{{ item.text }}</span>
                  </div>
                }
              </div>
              <div class="hsa-stack-inner">
                <div class="hsa-card" style="border-left-color: #f59e0b">
                  <h4 class="hsa-card__title" style="color: #f59e0b">Ideal Use Cases</h4>
                  <div class="hsa-tags">
                    @for (uc of detail.usecases; track uc) {
                      <span class="hsa-tag">{{ uc }}</span>
                    }
                  </div>
                </div>
                <div class="hsa-card" style="border-left-color: #22d3ee">
                  <h4 class="hsa-card__title" style="color: #22d3ee">Decision</h4>
                  <p class="hsa-decision">{{ detail.decision }}</p>
                </div>
              </div>
            </div>

            <!-- Roadmap (overview only) -->
            @if (activeTab() === 'overview') {
              <div class="hsa-card" style="border-left-color: #a78bfa">
                <h4 class="hsa-card__title" style="color: #a78bfa">Implementation Roadmap</h4>
                @for (r of roadmap; track r.phase) {
                  <div class="hsa-roadmap-item">
                    <div class="hsa-roadmap-item__phase">
                      <span class="hsa-roadmap-item__badge" [style.color]="r.color" [style.background]="r.color + '20'">{{ r.phase }}</span>
                      <span class="hsa-roadmap-item__time">{{ r.time }}</span>
                    </div>
                    <span class="hsa-roadmap-item__desc">{{ r.desc }}</span>
                  </div>
                }
              </div>
            }
          }
        }
      </div>
    </div>
  `,
  styles: [`
    @import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;600;700&family=Inter:wght@400;500;600;700&display=swap');

    :host { display: block; }

    .hsa-root {
      background: #0a0e17;
      min-height: 100vh;
      font-family: 'Inter', sans-serif;
      color: #e2e8f0;
    }
    .hsa-container {
      max-width: 860px;
      margin: 0 auto;
      padding: 20px 16px;
    }
    .hsa-title {
      font-size: 22px;
      font-weight: 700;
      font-family: 'JetBrains Mono', monospace;
      color: #22d3ee;
      margin: 0;
      letter-spacing: -0.5px;
    }
    .hsa-subtitle {
      font-size: 13px;
      color: #94a3b8;
      margin: 4px 0 20px;
    }

    /* Tabs */
    .hsa-tabs {
      display: flex;
      gap: 4px;
      margin-bottom: 20px;
      flex-wrap: wrap;
    }
    .hsa-tab {
      padding: 8px 14px;
      border-radius: 6px;
      border: 1px solid #2a3a52;
      background: #111827;
      color: #94a3b8;
      font-size: 11.5px;
      font-weight: 600;
      cursor: pointer;
      font-family: 'JetBrains Mono', monospace;
      transition: all 0.2s;
    }
    .hsa-tab:hover { border-color: #22d3ee50; }
    .hsa-tab--active {
      border-color: #22d3ee;
      background: #0e749040;
      color: #22d3ee;
    }

    /* Diagram */
    .hsa-diagram {
      border: 1px solid #2a3a52;
      border-radius: 12px;
      overflow: hidden;
      margin-bottom: 16px;
    }
    .hsa-diagram :deep(svg) {
      width: 100%;
      height: auto;
      display: block;
    }

    /* Description */
    .hsa-desc {
      background: linear-gradient(135deg, #111827 0%, #0a0e17 100%);
      border-radius: 10px;
      padding: 16px 20px;
      margin-bottom: 16px;
      border: 1px solid #22d3ee30;
      position: relative;
      overflow: hidden;
    }
    .hsa-desc__bar {
      position: absolute;
      top: 0; left: 0;
      width: 100%; height: 2px;
      background: linear-gradient(90deg, #22d3ee, #a78bfa, transparent);
    }
    .hsa-desc__content {
      display: flex;
      gap: 14px;
      align-items: flex-start;
    }
    .hsa-desc__icon { font-size: 24px; flex-shrink: 0; margin-top: 2px; }
    .hsa-desc__body { flex: 1; }
    .hsa-desc__title {
      font-size: 15px;
      font-weight: 700;
      color: #e2e8f0;
      margin: 0 0 6px;
      font-family: 'JetBrains Mono', monospace;
    }
    .hsa-desc__text {
      font-size: 13px;
      color: #94a3b8;
      line-height: 1.65;
      margin: 0 0 10px;
    }
    .hsa-desc__highlight {
      display: inline-block;
      padding: 4px 12px;
      border-radius: 6px;
      background: #22d3ee15;
      border: 1px solid #22d3ee30;
      font-size: 11px;
      font-weight: 600;
      color: #22d3ee;
      font-family: 'JetBrains Mono', monospace;
    }

    /* Grid */
    .hsa-grid-2 {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 14px;
      margin-bottom: 16px;
    }
    .hsa-stack { display: flex; flex-direction: column; gap: 16px; }
    .hsa-stack-inner { display: flex; flex-direction: column; gap: 14px; }

    /* Card */
    .hsa-card {
      background: #111827;
      border-radius: 10px;
      padding: 14px 18px;
      border: 1px solid #2a3a52;
      border-left: 3px solid #22d3ee;
    }
    .hsa-card__title {
      font-size: 13px;
      font-weight: 700;
      margin: 0 0 10px;
      font-family: 'JetBrains Mono', monospace;
    }

    /* Metric */
    .hsa-metric { margin-bottom: 8px; }
    .hsa-metric__header {
      display: flex;
      justify-content: space-between;
      margin-bottom: 3px;
    }
    .hsa-metric__label { font-size: 11px; color: #94a3b8; }
    .hsa-metric__value {
      font-size: 11px;
      font-weight: 600;
      font-family: 'JetBrains Mono', monospace;
    }
    .hsa-metric__track {
      height: 6px;
      background: #2a3a52;
      border-radius: 3px;
      overflow: hidden;
    }
    .hsa-metric__fill {
      height: 100%;
      border-radius: 3px;
      transition: width 0.5s ease;
    }

    /* Key-Value */
    .hsa-kv {
      display: flex;
      justify-content: space-between;
      padding: 4px 0;
      border-bottom: 1px solid #2a3a52;
    }
    .hsa-kv__label { font-size: 11px; color: #64748b; }
    .hsa-kv__value {
      font-size: 11px;
      font-weight: 600;
      color: #e2e8f0;
      font-family: 'JetBrains Mono', monospace;
    }

    /* ProCon */
    .hsa-procon {
      display: flex;
      gap: 8px;
      align-items: flex-start;
      margin-bottom: 6px;
    }
    .hsa-procon__icon {
      font-size: 10px;
      font-weight: 700;
      flex-shrink: 0;
      margin-top: 2px;
    }
    .hsa-procon__icon--pro { color: #34d399; }
    .hsa-procon__icon--con { color: #f87171; }
    .hsa-procon__icon--warn { color: #f59e0b; }
    .hsa-procon__text {
      font-size: 12px;
      color: #94a3b8;
      line-height: 1.5;
    }

    /* Tags */
    .hsa-tags { display: flex; flex-wrap: wrap; gap: 4px; }
    .hsa-tag {
      display: inline-block;
      padding: 3px 10px;
      border-radius: 12px;
      font-size: 10px;
      font-weight: 600;
      color: #f59e0b;
      background: #f59e0b18;
      border: 1px solid #f59e0b30;
    }

    /* Decision */
    .hsa-decision {
      font-size: 12px;
      color: #e2e8f0;
      line-height: 1.6;
      margin: 0;
      font-weight: 500;
    }

    /* Roadmap */
    .hsa-roadmap-item {
      display: flex;
      gap: 12px;
      margin-bottom: 12px;
      align-items: flex-start;
    }
    .hsa-roadmap-item__phase {
      display: flex;
      flex-direction: column;
      align-items: center;
      flex-shrink: 0;
    }
    .hsa-roadmap-item__badge {
      font-size: 11px;
      font-weight: 700;
      font-family: 'JetBrains Mono', monospace;
      padding: 3px 10px;
      border-radius: 4px;
    }
    .hsa-roadmap-item__time {
      font-size: 9px;
      color: #64748b;
      margin-top: 2px;
    }
    .hsa-roadmap-item__desc {
      font-size: 12px;
      color: #94a3b8;
      line-height: 1.5;
    }

    /* Comparison Table */
    .hsa-table-wrap { overflow-x: auto; }
    .hsa-table {
      width: 100%;
      border-collapse: collapse;
      font-size: 12px;
    }
    .hsa-table__th {
      text-align: left;
      padding: 8px 6px;
      border-bottom: 1px solid #2a3a52;
      color: #64748b;
      font-weight: 600;
    }
    .hsa-table__th--center { text-align: center; font-family: 'JetBrains Mono', monospace; font-size: 11px; }
    .hsa-table__td {
      padding: 8px 6px;
      border-bottom: 1px solid #2a3a52;
      color: #94a3b8;
      font-size: 11px;
    }
    .hsa-table__td--center { text-align: center; }
    .hsa-dots { display: flex; gap: 2px; justify-content: center; }
    .hsa-dot { width: 10px; height: 10px; border-radius: 50%; }
    .hsa-hint { font-size: 11px; color: #64748b; margin: 0 0 12px; }

    /* Scenarios */
    .hsa-scenario {
      background: #0a0e17;
      border-radius: 8px;
      margin-bottom: 10px;
      overflow: hidden;
      border: 1px solid #2a3a52;
      cursor: pointer;
      transition: all 0.2s;
    }
    .hsa-scenario--expanded { border-color: #22d3ee; }
    .hsa-scenario__header {
      padding: 10px 14px;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .hsa-scenario__query {
      font-size: 12px;
      font-weight: 600;
      color: #e2e8f0;
      font-family: 'JetBrains Mono', monospace;
    }
    .hsa-scenario__winner {
      margin-left: 10px;
      font-size: 10px;
      font-weight: 600;
      padding: 2px 8px;
      border-radius: 8px;
      background: #34d39920;
      color: #34d399;
    }
    .hsa-scenario__chevron {
      color: #64748b;
      font-size: 14px;
      transition: transform 0.2s;
    }
    .hsa-scenario__chevron--open { transform: rotate(180deg); }
    .hsa-scenario__grid {
      padding: 0 14px 14px;
      display: grid;
      grid-template-columns: 1fr 1fr 1fr;
      gap: 8px;
    }
    .hsa-scenario__col {
      background: #111827;
      border-radius: 6px;
      padding: 8px 10px;
      border-top: 2px solid;
    }
    .hsa-scenario__col-label {
      font-size: 10px;
      font-weight: 700;
      margin-bottom: 6px;
      font-family: 'JetBrains Mono', monospace;
    }
    .hsa-scenario__col-result {
      font-size: 10px;
      color: #94a3b8;
      margin-bottom: 4px;
    }
    .hsa-scenario__col-row {
      display: flex;
      justify-content: space-between;
      font-size: 10px;
    }
    .hsa-scenario__col-dim { color: #64748b; }
    .hsa-scenario__col-val {
      color: #e2e8f0;
      font-family: 'JetBrains Mono', monospace;
    }
    .hsa-scenario__col-quality { font-weight: 600; }

    /* Decision Tree */
    .hsa-dtree-item {
      margin-bottom: 12px;
      padding: 8px 12px;
      background: #0a0e17;
      border-radius: 6px;
    }
    .hsa-dtree-q {
      font-weight: 600;
      color: #e2e8f0;
      margin-bottom: 4px;
      font-family: 'JetBrains Mono', monospace;
      font-size: 11px;
    }
    .hsa-dtree-ans { font-size: 11px; color: #94a3b8; }
    .hsa-dtree-yes { color: #34d399; font-weight: 700; margin-right: 4px; }
    .hsa-dtree-no { color: #f87171; font-weight: 700; margin-right: 4px; }

    /* When to use */
    .hsa-when {
      padding: 10px 14px;
      background: #0a0e17;
      border-radius: 8px;
      margin-bottom: 10px;
      border-left: 3px solid;
    }
    .hsa-when__header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 6px;
    }
    .hsa-when__name {
      font-size: 13px;
      font-weight: 700;
      font-family: 'JetBrains Mono', monospace;
    }
    .hsa-when__badges { display: flex; gap: 8px; }
    .hsa-when__effort {
      font-size: 9px;
      padding: 2px 8px;
      border-radius: 8px;
      background: #111827;
      color: #94a3b8;
      border: 1px solid #2a3a52;
    }
    .hsa-when__risk {
      font-size: 9px;
      padding: 2px 8px;
      border-radius: 8px;
      font-weight: 600;
    }
    .hsa-when__desc {
      font-size: 12px;
      color: #94a3b8;
      margin: 0;
      line-height: 1.5;
    }

    @media (max-width: 640px) {
      .hsa-grid-2 { grid-template-columns: 1fr; }
      .hsa-scenario__grid { grid-template-columns: 1fr; }
    }
  `]
})
export class ArchitectureComponent {

  // --- State ---
  activeTab = signal<string>('overview');
  expandedScenario = signal<number | null>(null);

  // --- Tabs ---
  tabs: TabItem[] = [
    { id: 'overview', label: 'General Strategy' },
    { id: 'fallback', label: 'Fallback Cascade' },
    { id: 'rrf', label: 'RRF Fusion' },
    { id: 'comparison', label: 'Comparison' },
  ];

  // --- Tab Descriptions ---
  tabDescriptions: Record<string, TabDescription> = {
    overview: {
      title: 'General Strategy',
      icon: '🧠',
      text: 'The Query Router uses the CoreNLP confidence score to decide whether to route to pure DSL, pure KNN, or hybrid RRF. It is the brain of the entire system — it analyzes each incoming query, evaluates how well the deterministic pipeline can resolve it, and dynamically routes to the best-fitting path.',
      highlight: 'Target architecture that orchestrates all components',
    },
    fallback: {
      title: 'Fallback Cascade',
      icon: '🔄',
      text: 'The most pragmatic approach to start with. DSL first — if it doesn\'t reach the threshold, it falls back to KNN. Low risk, easy to implement on top of what you already have. The system keeps your current pipeline intact and only adds a second path when the first one doesn\'t resolve.',
      highlight: 'Best starting point — minimum risk, maximum learning',
    },
    rrf: {
      title: 'RRF Fusion',
      icon: '⚡',
      text: 'Runs both pipelines in parallel and merges rankings using Reciprocal Rank Fusion. ES 8.x supports it natively with sub_searches. Better recall than any single pipeline, but with higher computational cost as it always executes both.',
      highlight: 'Best quality/complexity ratio — native support in ES 8.8+',
    },
  };

  // --- Detail Data ---
  detailData: Record<string, DetailData> = {
    overview: {
      metrics: [
        { label: 'Implementation complexity', value: 4, max: 5, color: '#a78bfa' },
        { label: 'Flexibility / Scalability', value: 5, max: 5, color: '#34d399' },
        { label: 'Average latency', value: 3, max: 5, color: '#f59e0b' },
        { label: 'Result quality (recall)', value: 5, max: 5, color: '#22d3ee' },
      ],
      proscons: [
        { type: 'pro', text: 'Maximum coverage: exact queries go through DSL, ambiguous through KNN, intermediate through RRF' },
        { type: 'pro', text: 'The confidence router optimizes costs by executing KNN only when needed' },
        { type: 'pro', text: 'Optional re-ranker improves precision without changing the base pipeline' },
        { type: 'con', text: 'Higher operational complexity: maintain CoreNLP + embedding model + router' },
        { type: 'con', text: 'Requires quality metrics (NDCG, MRR) to calibrate router thresholds' },
        { type: 'warn', text: 'Cross-encoder re-ranker adds ~50-200ms latency per request' },
      ],
      kvdata: [
        { label: 'Min ES version', value: '8.x+' },
        { label: 'Pure DSL latency', value: '~5-20ms' },
        { label: 'KNN latency (100k docs)', value: '~20-80ms' },
        { label: 'Combined RRF latency', value: '~30-120ms' },
        { label: 'Re-ranker overhead', value: '+50-200ms' },
      ],
      usecases: ['Platforms with multiple search types', 'Systems where quality justifies complexity', 'Teams with ML ops capability'],
      decision: 'Long-term target architecture. Don\'t implement everything at once — follow the incremental roadmap starting with Fallback Cascade.',
    },
    fallback: {
      metrics: [
        { label: 'Implementation complexity', value: 2, max: 5, color: '#34d399' },
        { label: 'Flexibility / Scalability', value: 3, max: 5, color: '#f59e0b' },
        { label: 'Avg latency (happy path)', value: 1, max: 5, color: '#34d399' },
        { label: 'Result quality (recall)', value: 3, max: 5, color: '#f59e0b' },
      ],
      proscons: [
        { type: 'pro', text: 'Minimal impact on your current pipeline — just add a second path' },
        { type: 'pro', text: 'Happy path (DSL resolves) keeps current latency, ~5-20ms' },
        { type: 'pro', text: 'Easy to measure: log every fallback to detect patterns' },
        { type: 'pro', text: 'Low risk: if KNN fails or is slow, the system still works with DSL' },
        { type: 'con', text: 'Doesn\'t combine signals: you lose docs that DSL ranks low but KNN ranks high' },
        { type: 'con', text: 'Variable latency: worst case is DSL timeout + KNN timeout (~100-200ms)' },
        { type: 'con', text: 'The "few results" threshold is hard to calibrate without historical data' },
        { type: 'warn', text: 'Works well as step 1, but has a quality ceiling — migrate to RRF once you have metrics' },
      ],
      kvdata: [
        { label: 'Estimated effort', value: '1-2 sprints' },
        { label: 'Min ES version', value: '7.x (knn plugin)' },
        { label: 'Happy path latency', value: '~5-20ms' },
        { label: 'Fallback latency', value: '~50-120ms' },
        { label: 'Suggested threshold', value: '< 3 results OR score < 0.5' },
        { label: 'Additional infra', value: 'Embedding model' },
      ],
      usecases: ['Improve existing search without restructuring', 'Small teams or no dedicated ML ops', 'First step to validate embedding value'],
      decision: 'Best option to start. Gives you real data on when DSL fails and how much KNN improves, which is invaluable for deciding the next step.',
    },
    rrf: {
      metrics: [
        { label: 'Implementation complexity', value: 3, max: 5, color: '#f59e0b' },
        { label: 'Flexibility / Scalability', value: 5, max: 5, color: '#34d399' },
        { label: 'Average latency', value: 3, max: 5, color: '#f59e0b' },
        { label: 'Result quality (recall)', value: 5, max: 5, color: '#34d399' },
      ],
      proscons: [
        { type: 'pro', text: 'Combines signals from both pipelines — a doc ranked top 5 in both rises significantly' },
        { type: 'pro', text: 'ES 8.x supports RRF natively with sub_searches, no custom code needed' },
        { type: 'pro', text: 'Weights (w_dsl, w_knn) are configurable per query type or source_type' },
        { type: 'pro', text: 'BEIR/MS MARCO benchmark: RRF +8-15% NDCG@10 vs any single pipeline' },
        { type: 'con', text: 'Always executes both pipelines — higher computational cost per query' },
        { type: 'con', text: 'Requires the embedding model to always be available (point of failure)' },
        { type: 'con', text: 'Weight and k tuning requires A/B testing with real traffic' },
        { type: 'warn', text: 'Optimal weights change by query type — consider dynamic weights per intent' },
      ],
      kvdata: [
        { label: 'Estimated effort', value: '2-4 sprints' },
        { label: 'Min ES version', value: '8.8+ (native RRF)' },
        { label: 'Combined latency', value: '~30-120ms' },
        { label: 'k (rank constant)', value: '60 (ES default)' },
        { label: 'Typical recall improvement', value: '+8-15% NDCG@10' },
        { label: 'Suggested initial weights', value: 'DSL 0.6 / KNN 0.4' },
      ],
      usecases: ['Main product search (high visibility)', 'Multilingual content or technical jargon', 'Mixed queries: part structured, part natural language'],
      decision: 'Best quality/complexity ratio. Implement after having Fallback Cascade running and data on the fallback rate.',
    },
  };

  // --- Roadmap ---
  roadmap: RoadmapItem[] = [
    { phase: 'Phase 1', time: 'Sprint 1-2', desc: 'Fallback Cascade — DSL → KNN. Minimum change, maximum learning. Log fallback rate.', color: '#f59e0b' },
    { phase: 'Phase 2', time: 'Sprint 3-4', desc: 'Add context_vector to the indexing pipeline. Measure recall with historical queries.', color: '#34d399' },
    { phase: 'Phase 3', time: 'Sprint 5-7', desc: 'Migrate to native ES 8.x RRF. A/B test weights. Quality dashboards.', color: '#a78bfa' },
    { phase: 'Phase 4', time: 'Sprint 8+', desc: 'Re-ranker with cross-encoder or LLM for top-N refinement. Dynamic Query Router.', color: '#f87171' },
  ];

  // --- Comparison Data ---
  compStrategies = [
    { name: 'Fallback', color: '#f59e0b' },
    { name: 'RRF Fusion', color: '#a78bfa' },
    { name: 'Full Hybrid', color: '#22d3ee' },
  ];

  compDimensions = [
    { label: 'Complexity', values: [2, 3, 4] },
    { label: 'Recall', values: [3, 5, 5] },
    { label: 'Latency (lower=better)', values: [4, 3, 3] },
    { label: 'Infra cost', values: [1, 3, 4] },
    { label: 'Time to prod', values: [5, 3, 2] },
    { label: 'Scalability', values: [3, 5, 5] },
  ];

  compScenarios: CompScenario[] = [
    {
      scenario: 'Exact query: "JIRA-1234"',
      fallback: { result: 'DSL resolves directly', latency: '~10ms', quality: 'Excellent' },
      rrf: { result: 'DSL+KNN both run (unnecessary)', latency: '~60ms', quality: 'Excellent' },
      hybrid: { result: 'Router→DSL (high conf)', latency: '~10ms', quality: 'Excellent' },
      winner: 'Fallback / Hybrid',
    },
    {
      scenario: 'Ambiguous: "that migration doc"',
      fallback: { result: 'DSL fails → KNN finds it', latency: '~100ms', quality: 'Good' },
      rrf: { result: 'KNN high + DSL low → merges', latency: '~70ms', quality: 'Very good' },
      hybrid: { result: 'Router→KNN (low conf)', latency: '~50ms', quality: 'Very good' },
      winner: 'Hybrid',
    },
    {
      scenario: 'Mixed: "backend issues sprint 12"',
      fallback: { result: 'DSL partially resolves', latency: '~15ms', quality: 'Partial' },
      rrf: { result: 'DSL filters sprint + KNN "backend"', latency: '~80ms', quality: 'Excellent' },
      hybrid: { result: 'Router→RRF (mid conf)', latency: '~80ms', quality: 'Excellent' },
      winner: 'RRF / Hybrid',
    },
    {
      scenario: 'Semantic: "how do we deploy microservices"',
      fallback: { result: 'DSL empty → KNN semantic', latency: '~120ms', quality: 'Good' },
      rrf: { result: 'KNN dominates, DSL adds little', latency: '~70ms', quality: 'Very good' },
      hybrid: { result: 'Router→KNN direct', latency: '~50ms', quality: 'Very good' },
      winner: 'Hybrid',
    },
  ];

  decisionTree = [
    { q: 'Does your current DSL pipeline resolve >80% of queries?', yes: '→ Fallback Cascade is enough for now', no: '→ You need RRF or Hybrid' },
    { q: 'Do you have ES 8.8+ in production?', yes: '→ Use native ES RRF', no: '→ Implement Fallback + plan upgrade' },
    { q: 'Do you have ML infra (GPU, model serving)?', yes: '→ multilingual-e5-large self-hosted', no: '→ ELSER v2 native ES or external API' },
    { q: 'Do your queries mix structure + natural language?', yes: '→ Hybrid Router with dynamic weights', no: '→ RRF with static weights is enough' },
    { q: 'Do you need latency <50ms at p95?', yes: '→ Fallback or Router that skips KNN when unnecessary', no: '→ Always-on RRF is acceptable' },
  ];

  whenToUse = [
    { strategy: 'Fallback Cascade', when: 'You\'re starting out, small team, want to validate embeddings with minimum risk. Your DSL resolves most queries.', color: '#f59e0b', effort: '1-2 sprints', risk: 'Low' },
    { strategy: 'RRF Fusion', when: 'You already have embeddings working, ES 8.8+, and want maximum quality in main search. Your queries mix structure + natural language.', color: '#a78bfa', effort: '2-4 sprints', risk: 'Medium' },
    { strategy: 'Full Hybrid Router', when: 'High volume, multiple query types, team with ML ops. You want to optimize latency + quality with intelligent routing.', color: '#22d3ee', effort: '4-8 sprints', risk: 'High' },
  ];

  // --- SVG Diagrams ---
  private diagrams: Record<string, string> = {
    overview: `<svg viewBox="0 0 780 520" xmlns="http://www.w3.org/2000/svg">
      <rect width="780" height="520" fill="#0a0e17" rx="12"/>
      <text x="390" y="32" font-size="16" font-weight="700" fill="#e2e8f0" text-anchor="middle" font-family="'JetBrains Mono',monospace">Hybrid Search — General Strategy</text>
      <!-- User Query -->
      <rect x="310" y="55" width="160" height="42" rx="8" fill="#22d3ee18" stroke="#22d3ee" stroke-width="2"/>
      <text x="342" y="78" font-size="14" fill="#22d3ee">⌕</text>
      <text x="360" y="78" font-size="12.5" font-weight="600" fill="#e2e8f0" font-family="'JetBrains Mono',monospace">User Query</text>
      <!-- Query Router -->
      <rect x="280" y="130" width="220" height="50" rx="8" fill="#a78bfa18" stroke="#a78bfa" stroke-width="2"/>
      <text x="390" y="148" font-size="12.5" font-weight="600" fill="#e2e8f0" text-anchor="middle" font-family="'JetBrains Mono',monospace">Query Router</text>
      <text x="390" y="166" font-size="10" fill="#94a3b8" text-anchor="middle">CoreNLP → intent + confidence</text>
      <!-- Arrow Query→Router -->
      <defs><marker id="a1" markerWidth="8" markerHeight="6" refX="8" refY="3" orient="auto"><polygon points="0 0,8 3,0 6" fill="#22d3ee"/></marker></defs>
      <line x1="390" y1="97" x2="390" y2="130" stroke="#22d3ee" stroke-width="1.5" marker-end="url(#a1)"/>
      <!-- Confidence badge -->
      <rect x="330" y="195" width="120" height="20" rx="10" fill="#a78bfa30" stroke="#a78bfa" stroke-width="1"/>
      <text x="390" y="206" font-size="9.5" font-weight="600" fill="#a78bfa" text-anchor="middle" font-family="'JetBrains Mono',monospace">confidence score</text>
      <!-- Arrows to paths -->
      <defs><marker id="a2" markerWidth="8" markerHeight="6" refX="8" refY="3" orient="auto"><polygon points="0 0,8 3,0 6" fill="#f59e0b"/></marker></defs>
      <line x1="340" y1="180" x2="180" y2="240" stroke="#f59e0b" stroke-width="1.5" marker-end="url(#a2)"/>
      <text x="245" y="204" font-size="9" fill="#94a3b8" text-anchor="middle" font-family="'JetBrains Mono',monospace">high conf</text>
      <defs><marker id="a3" markerWidth="8" markerHeight="6" refX="8" refY="3" orient="auto"><polygon points="0 0,8 3,0 6" fill="#34d399"/></marker></defs>
      <line x1="440" y1="180" x2="580" y2="240" stroke="#34d399" stroke-width="1.5" marker-end="url(#a3)"/>
      <text x="525" y="204" font-size="9" fill="#94a3b8" text-anchor="middle" font-family="'JetBrains Mono',monospace">low conf</text>
      <defs><marker id="a4" markerWidth="8" markerHeight="6" refX="8" refY="3" orient="auto"><polygon points="0 0,8 3,0 6" fill="#a78bfa"/></marker></defs>
      <line x1="390" y1="180" x2="390" y2="265" stroke="#a78bfa" stroke-width="1.5" stroke-dasharray="4 3" marker-end="url(#a4)"/>
      <!-- DSL Box -->
      <rect x="80" y="240" width="200" height="50" rx="8" fill="#f59e0b18" stroke="#f59e0b" stroke-width="2"/>
      <text x="180" y="258" font-size="12.5" font-weight="600" fill="#e2e8f0" text-anchor="middle" font-family="'JetBrains Mono',monospace">Deterministic DSL</text>
      <text x="180" y="276" font-size="10" fill="#94a3b8" text-anchor="middle">bool + filter queries</text>
      <!-- KNN Box -->
      <rect x="500" y="240" width="200" height="50" rx="8" fill="#34d39918" stroke="#34d399" stroke-width="2"/>
      <text x="600" y="258" font-size="12.5" font-weight="600" fill="#e2e8f0" text-anchor="middle" font-family="'JetBrains Mono',monospace">KNN Vector Search</text>
      <text x="600" y="276" font-size="10" fill="#94a3b8" text-anchor="middle">dense_vector + cosine</text>
      <!-- Hybrid Box -->
      <rect x="290" y="265" width="200" height="50" rx="8" fill="#a78bfa18" stroke="#a78bfa" stroke-width="1.5" stroke-dasharray="6 4"/>
      <text x="390" y="283" font-size="12.5" font-weight="600" fill="#e2e8f0" text-anchor="middle" font-family="'JetBrains Mono',monospace">Hybrid (RRF)</text>
      <text x="390" y="301" font-size="10" fill="#94a3b8" text-anchor="middle">both pipelines</text>
      <!-- Arrows to normalizer -->
      <defs><marker id="a5" markerWidth="8" markerHeight="6" refX="8" refY="3" orient="auto"><polygon points="0 0,8 3,0 6" fill="#f59e0b"/></marker></defs>
      <line x1="180" y1="290" x2="340" y2="350" stroke="#f59e0b" stroke-width="1.5" marker-end="url(#a5)"/>
      <defs><marker id="a6" markerWidth="8" markerHeight="6" refX="8" refY="3" orient="auto"><polygon points="0 0,8 3,0 6" fill="#34d399"/></marker></defs>
      <line x1="600" y1="290" x2="440" y2="350" stroke="#34d399" stroke-width="1.5" marker-end="url(#a6)"/>
      <defs><marker id="a7" markerWidth="8" markerHeight="6" refX="8" refY="3" orient="auto"><polygon points="0 0,8 3,0 6" fill="#a78bfa"/></marker></defs>
      <line x1="390" y1="315" x2="390" y2="350" stroke="#a78bfa" stroke-width="1.5" stroke-dasharray="4 3" marker-end="url(#a7)"/>
      <!-- Normalizer -->
      <rect x="290" y="350" width="200" height="50" rx="8" fill="#22d3ee18" stroke="#22d3ee" stroke-width="2"/>
      <text x="390" y="368" font-size="12.5" font-weight="600" fill="#e2e8f0" text-anchor="middle" font-family="'JetBrains Mono',monospace">Score Normalizer</text>
      <text x="390" y="386" font-size="10" fill="#94a3b8" text-anchor="middle">min-max + weighted merge</text>
      <!-- Re-ranker -->
      <defs><marker id="a8" markerWidth="8" markerHeight="6" refX="8" refY="3" orient="auto"><polygon points="0 0,8 3,0 6" fill="#22d3ee"/></marker></defs>
      <line x1="390" y1="400" x2="390" y2="430" stroke="#22d3ee" stroke-width="1.5" marker-end="url(#a8)"/>
      <rect x="270" y="430" width="240" height="50" rx="8" fill="#f8717118" stroke="#f87171" stroke-width="1.5" stroke-dasharray="6 4"/>
      <text x="390" y="448" font-size="12.5" font-weight="600" fill="#e2e8f0" text-anchor="middle" font-family="'JetBrains Mono',monospace">Re-Ranker (optional)</text>
      <text x="390" y="466" font-size="10" fill="#94a3b8" text-anchor="middle">cross-encoder / LLM rerank</text>
      <defs><marker id="a9" markerWidth="8" markerHeight="6" refX="8" refY="3" orient="auto"><polygon points="0 0,8 3,0 6" fill="#22d3ee"/></marker></defs>
      <line x1="390" y1="480" x2="390" y2="500" stroke="#22d3ee" stroke-width="1.5" marker-end="url(#a9)"/>
      <text x="390" y="514" font-size="12" font-weight="600" fill="#22d3ee" text-anchor="middle" font-family="'JetBrains Mono',monospace">Final Results</text>
      <!-- Legend -->
      <rect x="20" y="420" width="12" height="12" rx="2" fill="#f59e0b40" stroke="#f59e0b" stroke-width="1"/>
      <text x="38" y="430" font-size="10" fill="#94a3b8">Deterministic</text>
      <rect x="20" y="440" width="12" height="12" rx="2" fill="#34d39940" stroke="#34d399" stroke-width="1"/>
      <text x="38" y="450" font-size="10" fill="#94a3b8">Semantic</text>
      <rect x="20" y="460" width="12" height="12" rx="2" fill="#a78bfa40" stroke="#a78bfa" stroke-width="1"/>
      <text x="38" y="470" font-size="10" fill="#94a3b8">Hybrid</text>
      <rect x="20" y="480" width="12" height="12" rx="2" fill="#f8717140" stroke="#f87171" stroke-width="1" stroke-dasharray="4 3"/>
      <text x="38" y="490" font-size="10" fill="#94a3b8">Optional</text>
    </svg>`,

    fallback: `<svg viewBox="0 0 780 480" xmlns="http://www.w3.org/2000/svg">
      <rect width="780" height="480" fill="#0a0e17" rx="12"/>
      <text x="390" y="32" font-size="16" font-weight="700" fill="#e2e8f0" text-anchor="middle" font-family="'JetBrains Mono',monospace">Strategy 1 — Fallback Cascade</text>
      <text x="390" y="52" font-size="11" fill="#94a3b8" text-anchor="middle">DSL first → if results &lt; threshold → KNN as fallback</text>
      <!-- Query -->
      <rect x="290" y="70" width="200" height="40" rx="8" fill="#22d3ee18" stroke="#22d3ee" stroke-width="2"/>
      <text x="390" y="94" font-size="12.5" font-weight="600" fill="#e2e8f0" text-anchor="middle" font-family="'JetBrains Mono',monospace">Incoming Query</text>
      <defs><marker id="fb1" markerWidth="8" markerHeight="6" refX="8" refY="3" orient="auto"><polygon points="0 0,8 3,0 6" fill="#22d3ee"/></marker></defs>
      <line x1="390" y1="110" x2="390" y2="135" stroke="#22d3ee" stroke-width="1.5" marker-end="url(#fb1)"/>
      <!-- DSL Step -->
      <rect x="260" y="135" width="260" height="48" rx="8" fill="#f59e0b18" stroke="#f59e0b" stroke-width="2"/>
      <text x="390" y="152" font-size="12.5" font-weight="600" fill="#e2e8f0" text-anchor="middle" font-family="'JetBrains Mono',monospace">① CoreNLP → DSL Query</text>
      <text x="390" y="170" font-size="10" fill="#94a3b8" text-anchor="middle">deterministic bool filters</text>
      <defs><marker id="fb2" markerWidth="8" markerHeight="6" refX="8" refY="3" orient="auto"><polygon points="0 0,8 3,0 6" fill="#f59e0b"/></marker></defs>
      <line x1="390" y1="183" x2="390" y2="210" stroke="#f59e0b" stroke-width="1.5" marker-end="url(#fb2)"/>
      <!-- Diamond 1 -->
      <polygon points="390,210 440,240 390,270 340,240" fill="#111827" stroke="#a78bfa" stroke-width="2"/>
      <text x="390" y="242" font-size="10" font-weight="600" fill="#e2e8f0" text-anchor="middle" font-family="'JetBrains Mono',monospace">results?</text>
      <!-- Good result -->
      <defs><marker id="fb3" markerWidth="8" markerHeight="6" refX="8" refY="3" orient="auto"><polygon points="0 0,8 3,0 6" fill="#34d399"/></marker></defs>
      <line x1="340" y1="240" x2="140" y2="240" stroke="#34d399" stroke-width="1.5" marker-end="url(#fb3)"/>
      <text x="240" y="234" font-size="9" fill="#94a3b8" text-anchor="middle" font-family="'JetBrains Mono',monospace">≥ threshold</text>
      <rect x="30" y="220" width="110" height="40" rx="8" fill="#34d39918" stroke="#34d399" stroke-width="2"/>
      <text x="85" y="244" font-size="12.5" font-weight="600" fill="#e2e8f0" text-anchor="middle" font-family="'JetBrains Mono',monospace">✓ Return</text>
      <!-- Bad result → KNN -->
      <defs><marker id="fb4" markerWidth="8" markerHeight="6" refX="8" refY="3" orient="auto"><polygon points="0 0,8 3,0 6" fill="#f87171"/></marker></defs>
      <line x1="390" y1="270" x2="390" y2="300" stroke="#f87171" stroke-width="1.5" marker-end="url(#fb4)"/>
      <text x="390" y="289" font-size="9" fill="#94a3b8" text-anchor="middle" font-family="'JetBrains Mono',monospace">&lt; threshold</text>
      <!-- KNN Step -->
      <rect x="260" y="300" width="260" height="48" rx="8" fill="#34d39918" stroke="#34d399" stroke-width="2"/>
      <text x="390" y="317" font-size="12.5" font-weight="600" fill="#e2e8f0" text-anchor="middle" font-family="'JetBrains Mono',monospace">② KNN Semantic Search</text>
      <text x="390" y="335" font-size="10" fill="#94a3b8" text-anchor="middle">embed query → cosine similarity</text>
      <defs><marker id="fb5" markerWidth="8" markerHeight="6" refX="8" refY="3" orient="auto"><polygon points="0 0,8 3,0 6" fill="#34d399"/></marker></defs>
      <line x1="390" y1="348" x2="390" y2="375" stroke="#34d399" stroke-width="1.5" marker-end="url(#fb5)"/>
      <!-- Diamond 2 -->
      <polygon points="390,375 440,400 390,425 340,400" fill="#111827" stroke="#a78bfa" stroke-width="2"/>
      <text x="390" y="402" font-size="10" font-weight="600" fill="#e2e8f0" text-anchor="middle" font-family="'JetBrains Mono',monospace">results?</text>
      <defs><marker id="fb6" markerWidth="8" markerHeight="6" refX="8" refY="3" orient="auto"><polygon points="0 0,8 3,0 6" fill="#34d399"/></marker></defs>
      <line x1="340" y1="400" x2="140" y2="400" stroke="#34d399" stroke-width="1.5" marker-end="url(#fb6)"/>
      <text x="240" y="394" font-size="9" fill="#94a3b8" text-anchor="middle" font-family="'JetBrains Mono',monospace">found</text>
      <rect x="30" y="380" width="110" height="40" rx="8" fill="#34d39918" stroke="#34d399" stroke-width="2"/>
      <text x="85" y="404" font-size="12.5" font-weight="600" fill="#e2e8f0" text-anchor="middle" font-family="'JetBrains Mono',monospace">✓ Return</text>
      <defs><marker id="fb7" markerWidth="8" markerHeight="6" refX="8" refY="3" orient="auto"><polygon points="0 0,8 3,0 6" fill="#f87171"/></marker></defs>
      <line x1="440" y1="400" x2="600" y2="400" stroke="#f87171" stroke-width="1.5" marker-end="url(#fb7)"/>
      <text x="520" y="394" font-size="9" fill="#94a3b8" text-anchor="middle" font-family="'JetBrains Mono',monospace">empty</text>
      <rect x="600" y="380" width="150" height="40" rx="8" fill="#f8717118" stroke="#f87171" stroke-width="1.5" stroke-dasharray="6 4"/>
      <text x="675" y="393" font-size="12.5" font-weight="600" fill="#e2e8f0" text-anchor="middle" font-family="'JetBrains Mono',monospace">③ Fuzzy + suggest</text>
      <text x="675" y="410" font-size="10" fill="#94a3b8" text-anchor="middle">did you mean...?</text>
    </svg>`,

    rrf: `<svg viewBox="0 0 780 500" xmlns="http://www.w3.org/2000/svg">
      <rect width="780" height="500" fill="#0a0e17" rx="12"/>
      <text x="390" y="32" font-size="16" font-weight="700" fill="#e2e8f0" text-anchor="middle" font-family="'JetBrains Mono',monospace">Strategy 2 — Reciprocal Rank Fusion</text>
      <text x="390" y="52" font-size="11" fill="#94a3b8" text-anchor="middle">Run both in parallel → merge rankings → combined score</text>
      <!-- Query -->
      <rect x="310" y="70" width="160" height="38" rx="8" fill="#22d3ee18" stroke="#22d3ee" stroke-width="2"/>
      <text x="390" y="93" font-size="12.5" font-weight="600" fill="#e2e8f0" text-anchor="middle" font-family="'JetBrains Mono',monospace">Query</text>
      <!-- Arrows to pipelines -->
      <defs><marker id="r1" markerWidth="8" markerHeight="6" refX="8" refY="3" orient="auto"><polygon points="0 0,8 3,0 6" fill="#f59e0b"/></marker></defs>
      <line x1="350" y1="108" x2="180" y2="140" stroke="#f59e0b" stroke-width="1.5" marker-end="url(#r1)"/>
      <defs><marker id="r2" markerWidth="8" markerHeight="6" refX="8" refY="3" orient="auto"><polygon points="0 0,8 3,0 6" fill="#34d399"/></marker></defs>
      <line x1="430" y1="108" x2="580" y2="140" stroke="#34d399" stroke-width="1.5" marker-end="url(#r2)"/>
      <!-- Parallel badge -->
      <rect x="355" y="115" width="70" height="20" rx="10" fill="#a78bfa30" stroke="#a78bfa" stroke-width="1"/>
      <text x="390" y="126" font-size="9.5" font-weight="600" fill="#a78bfa" text-anchor="middle" font-family="'JetBrains Mono',monospace">parallel</text>
      <!-- DSL Pipeline -->
      <rect x="40" y="140" width="280" height="180" rx="8" fill="#111827" stroke="#2a3a52" stroke-width="1"/>
      <text x="180" y="162" font-size="12" font-weight="700" fill="#f59e0b" text-anchor="middle" font-family="'JetBrains Mono',monospace">DSL Pipeline</text>
      <rect x="70" y="175" width="220" height="32" rx="8" fill="#f59e0b18" stroke="#f59e0b" stroke-width="2"/>
      <text x="180" y="195" font-size="12.5" font-weight="600" fill="#e2e8f0" text-anchor="middle" font-family="'JetBrains Mono',monospace">CoreNLP → DSL</text>
      <rect x="70" y="215" width="220" height="32" rx="8" fill="#f59e0b18" stroke="#f59e0b" stroke-width="2"/>
      <text x="180" y="235" font-size="12.5" font-weight="600" fill="#e2e8f0" text-anchor="middle" font-family="'JetBrains Mono',monospace">ES bool query</text>
      <rect x="70" y="255" width="220" height="50" rx="8" fill="#f59e0b18" stroke="#f59e0b" stroke-width="2"/>
      <text x="180" y="273" font-size="12.5" font-weight="600" fill="#e2e8f0" text-anchor="middle" font-family="'JetBrains Mono',monospace">Rank List A</text>
      <text x="180" y="291" font-size="10" fill="#94a3b8" text-anchor="middle">doc1:1st, doc5:2nd, doc3:3rd...</text>
      <!-- KNN Pipeline -->
      <rect x="460" y="140" width="280" height="180" rx="8" fill="#111827" stroke="#2a3a52" stroke-width="1"/>
      <text x="600" y="162" font-size="12" font-weight="700" fill="#34d399" text-anchor="middle" font-family="'JetBrains Mono',monospace">KNN Pipeline</text>
      <rect x="490" y="175" width="220" height="32" rx="8" fill="#34d39918" stroke="#34d399" stroke-width="2"/>
      <text x="600" y="195" font-size="12.5" font-weight="600" fill="#e2e8f0" text-anchor="middle" font-family="'JetBrains Mono',monospace">Embed query</text>
      <rect x="490" y="215" width="220" height="32" rx="8" fill="#34d39918" stroke="#34d399" stroke-width="2"/>
      <text x="600" y="235" font-size="12.5" font-weight="600" fill="#e2e8f0" text-anchor="middle" font-family="'JetBrains Mono',monospace">ES knn search</text>
      <rect x="490" y="255" width="220" height="50" rx="8" fill="#34d39918" stroke="#34d399" stroke-width="2"/>
      <text x="600" y="273" font-size="12.5" font-weight="600" fill="#e2e8f0" text-anchor="middle" font-family="'JetBrains Mono',monospace">Rank List B</text>
      <text x="600" y="291" font-size="10" fill="#94a3b8" text-anchor="middle">doc3:1st, doc1:2nd, doc7:3rd...</text>
      <!-- Arrows to RRF -->
      <defs><marker id="r3" markerWidth="8" markerHeight="6" refX="8" refY="3" orient="auto"><polygon points="0 0,8 3,0 6" fill="#f59e0b"/></marker></defs>
      <line x1="180" y1="320" x2="320" y2="360" stroke="#f59e0b" stroke-width="1.5" marker-end="url(#r3)"/>
      <defs><marker id="r4" markerWidth="8" markerHeight="6" refX="8" refY="3" orient="auto"><polygon points="0 0,8 3,0 6" fill="#34d399"/></marker></defs>
      <line x1="600" y1="320" x2="460" y2="360" stroke="#34d399" stroke-width="1.5" marker-end="url(#r4)"/>
      <!-- RRF Box -->
      <rect x="250" y="350" width="280" height="65" rx="8" fill="#5b21b640" stroke="#a78bfa" stroke-width="2"/>
      <text x="390" y="372" font-size="13" font-weight="700" fill="#a78bfa" text-anchor="middle" font-family="'JetBrains Mono',monospace">RRF Score</text>
      <text x="390" y="395" font-size="11" fill="#e2e8f0" text-anchor="middle" font-family="'JetBrains Mono',monospace">Σ 1/(k + rank_i) × weight_i</text>
      <text x="390" y="408" font-size="9" fill="#94a3b8" text-anchor="middle">k=60 (default) | w_dsl=0.6 | w_knn=0.4</text>
      <!-- Merged results -->
      <defs><marker id="r5" markerWidth="8" markerHeight="6" refX="8" refY="3" orient="auto"><polygon points="0 0,8 3,0 6" fill="#a78bfa"/></marker></defs>
      <line x1="390" y1="415" x2="390" y2="445" stroke="#a78bfa" stroke-width="1.5" marker-end="url(#r5)"/>
      <rect x="290" y="445" width="200" height="40" rx="8" fill="#22d3ee18" stroke="#22d3ee" stroke-width="2"/>
      <text x="390" y="459" font-size="12.5" font-weight="600" fill="#e2e8f0" text-anchor="middle" font-family="'JetBrains Mono',monospace">Merged Results</text>
      <text x="390" y="476" font-size="10" fill="#94a3b8" text-anchor="middle">sorted by RRF score</text>
    </svg>`,
  };

  // --- Computed ---
  currentDiagram = computed(() => this.diagrams[this.activeTab()] || '');
  currentDescription = computed(() => this.tabDescriptions[this.activeTab()] || null);
  currentDetail = computed(() => this.detailData[this.activeTab()] || null);

  // --- Methods ---
  setActiveTab(id: string): void {
    this.activeTab.set(id);
    this.expandedScenario.set(null);
  }

  toggleScenario(index: number): void {
    this.expandedScenario.set(this.expandedScenario() === index ? null : index);
  }

  getScenarioCols(s: CompScenario) {
    return [
      { label: 'Fallback', data: s.fallback, color: '#f59e0b' },
      { label: 'RRF', data: s.rrf, color: '#a78bfa' },
      { label: 'Hybrid', data: s.hybrid, color: '#22d3ee' },
    ];
  }

  getQualityColor(quality: string): string {
    switch (quality) {
      case 'Excellent': return '#34d399';
      case 'Very good': return '#22d3ee';
      case 'Good': return '#f59e0b';
      default: return '#f87171';
    }
  }

  getRiskBg(risk: string): string {
    switch (risk) {
      case 'Low': return '#34d39920';
      case 'Medium': return '#f59e0b20';
      default: return '#f8717120';
    }
  }

  getRiskColor(risk: string): string {
    switch (risk) {
      case 'Low': return '#34d399';
      case 'Medium': return '#f59e0b';
      default: return '#f87171';
    }
  }
}
