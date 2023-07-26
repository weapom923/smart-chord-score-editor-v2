<template>
  <div id="section-container">
    <div
      id="system-container"
      v-for="(systemComponentProp, systemIdx) of $_systemComponentProps"
      v-bind:key="systemIdx"
    >
      <div class="section-name-container pr-5">
        <template v-if="systemIdx === 0">
          <v-menu
            open-on-hover
            close-on-back
            close-on-content-click
            location="bottom"
            open-delay="0"
            v-bind:disabled="$store.state.appState.isPrintLayoutEnabled"
          >
            <template v-slot:activator="{ props }">
              <div
                class="section-name-menu-area py-3"
                v-if="$_isSectionContainingFirstBar"
                v-bind="props"
              >
                {{ $_section.name }}
              </div>
            </template>
  
            <section-name-hover-menu v-bind:section-idx="sectionIdx">
            </section-name-hover-menu>
          </v-menu>
        </template>
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
import SystemComponent from './SystemComponent.vue';
import SectionNameHoverMenu from './parts/SectionNameHoverMenu.vue';
import { Score } from '../modules/Score';
import { Section } from '../modules/Section';
import { Bar } from '../modules/Bar';
import { bb } from '../modules/BarBreak';
import { SectionAndBarIdx, BarRange } from '../modules/SectionAndBarRange';

type SystemComponentPropsType = InstanceType<typeof SystemComponent>['$props'];

export default {
  components: {
    SystemComponent,
    SectionNameHoverMenu,
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
      let systemDefinitions: SystemComponentPropsType[] = [];
      let firstBarIdxOfCurrentSystem = this.barRange.firstBarIdx;
      let previousBar: Bar | undefined = undefined;
      for (let barIdx of this.barRange.indices()) {
        let currentBar = this.$_section.getBar(barIdx);
        let isSectionLastBar = (barIdx === this.barRange.lastBarIdx);
        let isSectionBroken = !currentBar.break.isEqualTo(bb.empty);
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
  },

  methods: {
    async $_selectBar({ barIdx, event }: { barIdx: number, event: MouseEvent }) {
      await this.$store.dispatch(
        (event.shiftKey)? 'score/expandSelectedBars' : 'score/selectBar',
        new SectionAndBarIdx(this.sectionIdx, barIdx),
      );
    },
  }
}
</script>