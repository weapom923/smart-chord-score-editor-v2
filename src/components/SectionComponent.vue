<template>
  <div id="section-container">
    <div
      id="system-container"
      v-for="(systemComponentProp, systemIdx) of $_systemComponentProps"
      v-bind:key="systemIdx"
    >
      <div class="section-name-container pr-5">
        <div
          class="section-name-menu-area py-3 position-relative"
          v-if="systemIdx === 0 && $_isSectionContainingFirstBar"
          v-on:contextmenu.capture.stop.prevent="$_onContextmenuStaff"
        >
          {{ $_section.name }}
        </div>
      </div>
      <system-component
        v-bind="systemComponentProp"
        v-on:mousedown-staff="$_selectBar"
      />
    </div>
  </div>
</template>

<style scoped>
#section-container {
  display: flex;
  flex-direction: column;
}

.section-name-container {
  display: flex;
  min-width: 100px;
  align-items: center;
}

.section-name-menu-area {
  width: 100%;
  text-align: right;
}

#system-container {
  display: flex;
  flex-direction: row;
}
</style>

<script lang="ts">
import { defineComponent } from 'vue';
import { ContextMenuItem, ContextMenuParameters } from '../store/module/ContextMenu';
import SystemComponent from './SystemComponent.vue';
import { Score } from '../modules/Score';
import { Section } from '../modules/Section';
import { Bar } from '../modules/Bar';
import { bb } from '../modules/BarBreak';
import { SectionAndBarIdx, SectionAndBarRange, BarRange } from '../modules/SectionAndBarRange';

type SystemComponentPropsType = InstanceType<typeof SystemComponent>['$props'];

export default defineComponent({
  components: {
    SystemComponent,
  },

  props: {
    score: { type: Score, required: true },
    sectionIdx: { type: Number, required: true },
    barRange: { type: BarRange, required: true },
    showBeatOnFirstBar: { type: Boolean, required: true },
  },

  computed: {
    $_section(): Section {
      return this.score.getSection(this.sectionIdx);
    },

    $_isSectionContainingFirstBar() {
      return (this.barRange.firstBarIdx === this.$_section.firstBarIdx);
    },

    $_systemComponentProps(): SystemComponentPropsType[] {
      const systemDefinitions: SystemComponentPropsType[] = [];
      let firstBarIdxOfCurrentSystem = this.barRange.firstBarIdx;
      let previousBar: Bar | undefined = undefined;
      for (const barIdx of this.barRange.indices()) {
        const currentBar = this.$_section.getBar(barIdx);
        const isSectionLastBar = (barIdx === this.barRange.lastBarIdx);
        const isSectionBroken = !currentBar.break.isEqualTo(bb.empty);
        if (isSectionBroken || isSectionLastBar) {
          let showBeatOnFirstBar = this.showBeatOnFirstBar;
          if (firstBarIdxOfCurrentSystem !== this.barRange.firstBarIdx) {
            if (previousBar !== undefined) {
              showBeatOnFirstBar = !previousBar.value.isEqualTo(currentBar.value);
            }
          }
          systemDefinitions.push(
            {
              score: this.score,
              section: this.$_section,
              sectionIdx: this.sectionIdx,
              barRange: new BarRange(firstBarIdxOfCurrentSystem, barIdx),
              showBeatOnFirstBar,
              showBarHoverMenu: true,
            },
          );
          firstBarIdxOfCurrentSystem = barIdx + 1;
        }
        previousBar = currentBar;
      }
      return systemDefinitions;
    },

    $_sectionMenuItems(): ContextMenuItem[] {
      const sectionAndBarRange: SectionAndBarRange = new SectionAndBarRange(
        new SectionAndBarIdx(this.sectionIdx, this.$_section.firstBarIdx),
        new SectionAndBarIdx(this.sectionIdx, this.$_section.lastBarIdx),
      );

      return [
        {
          icon: 'mdi-plus',
          text: this.$t('insertSectionBefore'),
          callback: async () => { await this.$_generateNewSection(this.sectionIdx) },
        },
        {
          icon: 'mdi-select-all',
          text: this.$t('selectSection'),
          callback: async () => { await this.$store.dispatch('score/selectBars', sectionAndBarRange) },
        },
        {
          icon: 'mdi-delete',
          text: this.$t('deleteSection'),
          callback: async () => { await this.$store.dispatch('score/removeBars', sectionAndBarRange) },
        },
        {
          icon: 'mdi-content-copy',
          text: this.$t('copySection'),
          callback: async () => { await this.$store.dispatch('score/setCopiedBars', sectionAndBarRange) },
        },
        {
          icon: 'mdi-content-paste',
          text: this.$t('pasteSection'),
          callback: async () => { await this.$store.dispatch('score/pasteCopiedBarsPartOnly', sectionAndBarRange) },
          disabled: (this.$store.state.score.copiedBars.length === 0),
        },
        {
          icon: 'mdi-file-cog',
          text: this.$t('sectionSetting'),
          callback: async () => {
            await this.$store.dispatch(
              'dialog/setDialog',
              {
                componentName: 'section-editor-dialog',
                props: {
                  sectionIdx: this.sectionIdx,
                },
              },
            );
          },
        },
        {
          icon: 'mdi-plus',
          text: this.$t('insertSectionAfter'),
          callback: async () => { await this.$_generateNewSection(this.sectionIdx + 1) },
        },
      ];
    },
  },

  methods: {
    async $_selectBar({ barIdx, event }: { barIdx: number, event: MouseEvent }) {
      await this.$store.dispatch(
        (event.shiftKey)? 'score/expandSelectedBars' : 'score/selectBar',
        new SectionAndBarIdx(this.sectionIdx, barIdx),
      );
    },

    async $_generateNewSection(sectionIdx: number) {
      const numSection = this.$store.state.score.score.numSections;
      if (numSection > 0) {
        const baseSectionIdx = (sectionIdx > 0)? sectionIdx - 1 : sectionIdx;
        const baseSection = this.$store.state.score.score.getSection(baseSectionIdx);
        if (baseSection.numBars > 0) {
          const baseBar = baseSection.lastBar as Bar;
          await this.$store.dispatch(
            'dialog/setDialog',
            {
              componentName: 'generate-section-dialog',
              props: {
                sectionIdx: sectionIdx,
                barValue: baseBar.value,
                clef: baseBar.clef,
                scale: baseBar.scale,
                partInBarTypes: baseBar.parts.map(part => part.type),
                gridNoteValue: this.$store.state.config.defaultGridNoteValue,
              },
            },
          );
        }
      } else {
        await this.$store.dispatch(
          'dialog/setDialog',
          {
            componentName: 'generate-section-dialog',
            props: {
              sectionIdx: sectionIdx,
            },
          },
        );
      }
    },

    async $_onContextmenuStaff(event: Event) {
      const parameters: ContextMenuParameters = {
        activator: event.target as HTMLElement,
        menuItems: this.$_sectionMenuItems,
      };
      await this.$store.dispatch('contextMenu/setParameters', parameters);
    },
  },
})
</script>