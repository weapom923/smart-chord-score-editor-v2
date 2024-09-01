<template>
  <div
    id="audio-play-time-controller"
    ref="audioPlayTimeController"
    class="d-flex flex-grow-1 flex-column position-relative overflow-hidden"
    v-on:wheel.prevent="$_onWheel"
    v-on:mousedown="$_onMousedown"
  >
    <div
      id="view-begin-shadow"
      class="position-absolute h-100 left-0"
      v-if="!$_isViewBeginEdgeDisplayed"
    >
    </div>

    <div
      id="view-end-shadow"
      class="position-absolute h-100 right-0"
      v-if="!$_isViewEndEdgeDisplayed"
    >
    </div>

    <div
      class="position-relative flex-grow-1"
      v-for="channelIdx of $_channelIdcs"
      v-bind:key="channelIdx"
    >
      <waveform-canvas
        class="position-absolute w-100 h-100 left-0"
        v-bind:color="waveformColor"
        v-bind:waveform-decimator="waveformDecimator"
        v-bind:channel-idx="channelIdx"
        v-bind:sample-value-scale="$data.$_sampleValueScale"
        v-bind:view-sample-begin="$_viewRangeBeginSampleWithDragOffset"
        v-bind:view-sample-end="$_viewRangeEndSampleWithDragOffset"
        v-bind:view-width="$data.$_viewWidth"
      >
      </waveform-canvas>
    </div>

    <div
      id="play-time-indicator"
      class="position-absolute h-100 overflow-x-visible overflow-y-hidden"
      v-if="$_playTimeIndicatorStyle"
      v-bind:style="$_playTimeIndicatorStyle"
    >
    </div>

    <div
      id="loop-time-range-indicator"
      class="position-absolute h-100"
      v-if="$_loopTimeRangeIndicatorStyle"
      v-bind:style="$_loopTimeRangeIndicatorStyle"
      v-on:mousedown.shift.stop="$_onMousedown($event, 'offset_loop')"
    >
      <div class="position-absolute h-100 left-0 overflow-visible">
        <div
          class="loop-time-range-handle h-100"
          v-on:mousedown.stop="$_onMousedown($event, 'modify_loop_begin')"
        >
        </div>
      </div>
      <div class="position-absolute h-100 right-0 overflow-visible">
        <div
          class="loop-time-range-handle h-100"
          v-on:mousedown.stop="$_onMousedown($event, 'modify_loop_end')"
        >
        </div>
      </div>
    </div>
  </div>
  <v-tooltip location="top" v-bind:text="$t($data.$_isAutoScrollEnabled? 'disableAutoScroll' : 'enableAutoScroll')">
    <template v-slot:activator="{ props }">
      <v-btn
        icon="mdi-arrow-collapse-right" size="small"
        v-bind="props"
        v-bind:base-color="playTimeColor.styleString(false)"
        v-bind:active="$data.$_isAutoScrollEnabled"
        v-bind:disabled="$_isViewBeginEdgeDisplayed && $_isViewEndEdgeDisplayed"
        v-on:click.stop="$_toggleAutoScroll"
        v-on:keydown.enter.stop="$_toggleAutoScroll"
      >
      </v-btn>
    </template>
  </v-tooltip>
</template>

<style scoped>
#play-time-indicator, #loop-time-range-indicator {
  border-style: solid;
}

#play-time-indicator {
  border-width: 0 0 0 1px;
}

#loop-time-range-indicator {
  border-width: 0 1px;
}

.loop-time-range-handle {
  cursor: ew-resize;
  margin-left: -5px;
  width: 10px;
}

#view-begin-shadow {
  width: 10px;
  box-shadow: inset 10px 0 10px -10px;
}

#view-end-shadow {
  width: 10px;
  box-shadow: inset -10px 0 10px -10px;
}
</style>

<script lang="ts">
import { CSSProperties, defineComponent } from 'vue';
import WaveformCanvas from '../canvases/WaveformCanvas.vue';
import WaveformDecimator from '../../modules/WaveformDecimator';
import { TimeRangeSec, TimeRangeSecInterface } from './modules/TimeRangeSec';
import { times } from '../../modules/utils';
import { cl, Color } from '../../modules/Color';

const getWheelDelta = (wheelEvent: WheelEvent): number => {
  const baseDelta = (wheelEvent.deltaX + wheelEvent.deltaY);
  switch (wheelEvent.deltaMode) {
    case 0:  return baseDelta;
    case 1:  return baseDelta * 10;
    case 2:  return baseDelta * 100;
    default: return 0;
  }
};

const playTimeColor = cl.red;
const loopTimeRangeColor = new Color(255, 32, 32, 0.2);
const waveformColor = new Color(196, 0, 0, 0.3);

const viewTimeMinSec = 0;
const valueScaleMin = 1;
const valueScaleMax = 10;

type DragMode = 'set_loop_definition' | 'seek' | 'modify_loop_begin' | 'modify_loop_end' | 'offset_loop' | 'offset_view';

const AudioPlaytimeController = defineComponent({
  emits: {
    'update:loopDefinition': (loopDefinition?: TimeRangeSec) => true,
    seekInSec: (seekTimeSec: number) => true,
    seekStart: () => true,
    seekEnd: () => true,
  },

  components: {
    WaveformCanvas,
  },

  setup(): {
    playTimeColor: Color,
    waveformColor: Color,
  } {
    return {
      playTimeColor,
      waveformColor,
    };
  },

  props: {
    waveformDecimator: { type: WaveformDecimator, required: true },
    samplingRate: { type: Number, required: true },
    playTimeSec: { type: Number, required: true },
    loopDefinition: { type: TimeRangeSec },
  },

  data(vm): {
    $_sampleValueScale: number,
    $_viewTimeRangeBeginSec: number,
    $_viewTimeRangeEndSec: number,
    $_dragMode?: DragMode,
    $_timeSecOnMousedown?: number,
    $_timeSecOnMousemove?: number,
    $_resizeObserver: ResizeObserver,
    $_viewWidth: number,
    $_elementClientX: number,
    $_isAutoScrollEnabled: boolean,
  } {
    return {
      $_sampleValueScale: 1,
      $_viewTimeRangeBeginSec: 0,
      $_viewTimeRangeEndSec: vm.waveformDecimator.numSamples / vm.samplingRate,
      $_dragMode: undefined,
      $_timeSecOnMousedown: undefined,
      $_timeSecOnMousemove: undefined,
      $_resizeObserver: new ResizeObserver(
        (event: ResizeObserverEntry[]) => { this.$_onResize(event[0].target as HTMLDivElement) },
      ),
      $_viewWidth: 1,
      $_elementClientX: 0,
      $_isAutoScrollEnabled: false,
    };
  },

  computed: {
    $_element(): HTMLDivElement { return this.$refs.audioPlayTimeController as HTMLDivElement },
    $_channelIdcs(): number[] { return times(this.waveformDecimator.numChannels) },
    $_viewTimeRangeSec: {
      get(): TimeRangeSec {
        return new TimeRangeSec({
          begin: this.$data.$_viewTimeRangeBeginSec,
          end: this.$data.$_viewTimeRangeEndSec,
        });
      },
      set({ begin, end }: TimeRangeSec) {
        this.$data.$_viewTimeRangeBeginSec = begin;
        this.$data.$_viewTimeRangeEndSec = end;
      },
    },
    $_viewTimeRangeSecWithDragOffset(): TimeRangeSec {
      switch (this.$data.$_dragMode) {
        case 'offset_view':
          return new TimeRangeSec(this.$_truncateTimeRange({
            begin: this.$_viewTimeRangeSec.begin - this.$_dragOffsetSec,
            end: this.$_viewTimeRangeSec.end - this.$_dragOffsetSec,
          }));
        default:
          return this.$_viewTimeRangeSec;
      }
    },
    $_viewRangeBeginSampleWithDragOffset(): number { return this.$_viewTimeRangeSecWithDragOffset.begin * this.samplingRate },
    $_viewRangeEndSampleWithDragOffset(): number { return this.$_viewTimeRangeSecWithDragOffset.end * this.samplingRate },
    $_isViewBeginEdgeDisplayed(): boolean { return this.$_viewTimeRangeSecWithDragOffset.begin === viewTimeMinSec },
    $_isViewEndEdgeDisplayed(): boolean { return this.$_viewTimeRangeSecWithDragOffset.end === this.$_viewTimeMaxSec },
    $_dragOffsetSec(): number {
      if (this.$data.$_timeSecOnMousedown === undefined) return 0;
      if (this.$data.$_timeSecOnMousemove === undefined) return 0;
      return this.$data.$_timeSecOnMousemove - this.$data.$_timeSecOnMousedown;
    },
    $_viewTimeMaxSec(): number { return this.waveformDecimator.numSamples / this.samplingRate },
    $_viewDurationSec(): number { return this.$_viewTimeRangeSec.duration },
    $_viewDurationMinSec(): number { return this.$data.$_viewWidth / this.samplingRate },
    $_viewDurationMaxSec(): number { return this.$_viewTimeMaxSec - viewTimeMinSec },
    $_secPerPx(): number { return this.$_viewDurationSec / this.$data.$_viewWidth },
    $_pxPerSec(): number { return this.$data.$_viewWidth / this.$_viewDurationSec },
    $_playTimeIndicatorStyle(): CSSProperties | undefined {
      const playTimeOffsetPxFromViewBegin = (this.playTimeSec - this.$_viewTimeRangeSecWithDragOffset.begin) * this.$_pxPerSec;
      if (
        (playTimeOffsetPxFromViewBegin < 0) ||
        (playTimeOffsetPxFromViewBegin > this.$data.$_viewWidth)
      ) {
        return undefined;
      }
      return {
        borderColor: playTimeColor.styleString(false),
        left: `${playTimeOffsetPxFromViewBegin}px`,
      };
    },
    $_loopTimeRangeSec(): TimeRangeSec | undefined {
      switch (this.$data.$_dragMode) {
        case 'set_loop_definition':
          if (
            (this.$data.$_timeSecOnMousedown !== undefined) &&
            (this.$data.$_timeSecOnMousemove !== undefined)
          ) {
            return new TimeRangeSec({
              begin: this.$data.$_timeSecOnMousedown,
              end: this.$_truncateViewTime(this.$data.$_timeSecOnMousemove),
            });
          }
          break;
        case 'modify_loop_begin':
          if (
            this.loopDefinition &&
            (this.$data.$_timeSecOnMousedown !== undefined) &&
            (this.$data.$_timeSecOnMousemove !== undefined)
          ) {
            return new TimeRangeSec({
              begin: this.$_truncateViewTime(this.loopDefinition.begin + this.$_dragOffsetSec),
              end: this.loopDefinition.end,
            });
          }
          break;
        case 'modify_loop_end':
          if (
            this.loopDefinition &&
            (this.$data.$_timeSecOnMousedown !== undefined) &&
            (this.$data.$_timeSecOnMousemove !== undefined)
          ) {
            return new TimeRangeSec({
              begin: this.loopDefinition.begin,
              end: this.$_truncateViewTime(this.loopDefinition.end + this.$_dragOffsetSec),
            });
          }
          break;
        case 'offset_loop':
          if (
            this.loopDefinition &&
            (this.$data.$_timeSecOnMousedown !== undefined) &&
            (this.$data.$_timeSecOnMousemove !== undefined)
          ) {
            return new TimeRangeSec(this.$_truncateTimeRange({
              begin: this.loopDefinition.begin + this.$_dragOffsetSec,
              end: this.loopDefinition.end + this.$_dragOffsetSec,
            }));
          }
          break;
      }
      if (this.loopDefinition) {
        return new TimeRangeSec({
          begin: this.loopDefinition.begin,
          end: this.loopDefinition.end,
        });
      }
      return undefined;
    },
    $_loopTimeRangeIndicatorStyle(): CSSProperties | undefined {
      if (!this.$_loopTimeRangeSec) return undefined;
      if (this.$_loopTimeRangeSec.begin >= this.$_viewTimeRangeSecWithDragOffset.end) return undefined;
      if (this.$_loopTimeRangeSec.end < this.$_viewTimeRangeSecWithDragOffset.begin) return undefined;
      const loopTimeRangeBeginOffsetPxFromViewBegin = (this.$_loopTimeRangeSec.begin - this.$_viewTimeRangeSecWithDragOffset.begin) * this.$_pxPerSec;
      const loopTimeDurationPx = (this.$_loopTimeRangeSec.end - this.$_loopTimeRangeSec.begin) * this.$_pxPerSec;
      return {
        borderColor: loopTimeRangeColor.styleString(true),
        backgroundColor: loopTimeRangeColor.styleString(true),
        left: `${loopTimeRangeBeginOffsetPxFromViewBegin}px`,
        width: `${loopTimeDurationPx}px`,
      };
    },
  },

  watch: {
    playTimeSec(playTimeSec: number) {
      if (!this.$data.$_isAutoScrollEnabled) return;
      if (this.$data.$_dragMode !== undefined) return;
      if (playTimeSec < this.$_viewTimeRangeSec.begin) {
        this.$_updateViewTimeRange({ begin: playTimeSec - this.$_viewDurationSec, end: playTimeSec });
      } else if (playTimeSec > this.$_viewTimeRangeSec.end) {
        this.$_updateViewTimeRange({ begin: playTimeSec, end: playTimeSec + this.$_viewDurationSec });
      }
    },
  },

  mounted() {
    this.$_onResize(this.$_element);
    this.$data.$_resizeObserver.observe(this.$_element);
  },

  beforeUnmount() {
    this.$data.$_resizeObserver.unobserve(this.$_element);
  },

  methods: {
    $_onResize(element: HTMLDivElement) {
      const { x, width } = element.getBoundingClientRect();
      this.$data.$_viewWidth = width;
      this.$data.$_elementClientX = x;
    },

    $_onMousedown(mouseEvent: MouseEvent, dragMode?: DragMode) {
      const eventTimeSec = this.$_getEventTimeSec(mouseEvent);
      if (eventTimeSec === undefined) return;
      this.$data.$_timeSecOnMousedown = eventTimeSec;
      if (dragMode) {
        this.$data.$_dragMode = dragMode;
      } else if (mouseEvent.button === 1) {
        this.$data.$_dragMode = 'offset_view';
      } else if (mouseEvent.shiftKey) {
        this.$data.$_dragMode = 'set_loop_definition';
      } else {
        this.$data.$_dragMode = 'seek';
      }
      switch (this.$data.$_dragMode) {
        case 'seek':
          this.$nextTick(() => {
            this.$emit('seekStart');
            this.$emit('seekInSec', eventTimeSec);
          })
          break;
      }
      window.addEventListener('mousemove', this.$_onMousemove);
      window.addEventListener('mouseup', this.$_onMouseup);
    },

    $_onMousemove(mouseEvent: MouseEvent) {
      const eventTimeSec = this.$_getEventTimeSec(mouseEvent);
      if (eventTimeSec === undefined) return;
      this.$data.$_timeSecOnMousemove = eventTimeSec;
      switch (this.$data.$_dragMode) {
        case 'seek':
          this.$emit('seekInSec', this.$data.$_timeSecOnMousemove);
          break;
      }
      if (mouseEvent.buttons === 0) this.$_onMouseup();
    },

    $_onMouseup() {
      window.removeEventListener('mousemove', this.$_onMousemove);
      window.removeEventListener('mouseup', this.$_onMouseup);
      switch (this.$data.$_dragMode) {
        case 'seek':
          this.$emit('seekEnd');
          break;
        case 'set_loop_definition':
        case 'modify_loop_begin':
        case 'modify_loop_end':
          if (this.$data.$_timeSecOnMousemove === undefined) {
            this.$emit('update:loopDefinition', undefined);
          } else {
            if (this.$_loopTimeRangeSec) {
              this.$emit('update:loopDefinition', this.$_loopTimeRangeSec);
            }
          }
          break;
        case 'offset_loop':
          if (this.$_loopTimeRangeSec) {
            this.$emit('update:loopDefinition', this.$_loopTimeRangeSec);
          }
          break;
        case 'offset_view':
          this.$_viewTimeRangeSec = this.$_viewTimeRangeSecWithDragOffset;
          break;
      }
      this.$data.$_timeSecOnMousedown = undefined;
      this.$data.$_timeSecOnMousemove = undefined;
      this.$data.$_dragMode = undefined;
    },

    $_onWheel(wheelEvent: WheelEvent) {
      const onWheel = (wheelEvent: WheelEvent): boolean => {
        const delta = getWheelDelta(wheelEvent)
        const eventTimeSec = this.$_getEventTimeSec(wheelEvent);
        if (eventTimeSec === undefined) return false;
        if (wheelEvent.ctrlKey) {
          if (wheelEvent.shiftKey) {
            this.$_changeValueScale(delta);
            return true;
          } else {
            return this.$_changeTimeScale(eventTimeSec, delta);
          }
        } else {
          return this.$_offsetTimeSec(delta);
        }
      }
      if (onWheel(wheelEvent)) {
        wheelEvent.stopPropagation();
      }
    },

    $_truncateValueScale(sampleValueScale: number) {
      sampleValueScale = Math.max(sampleValueScale, valueScaleMin);
      sampleValueScale = Math.min(sampleValueScale, valueScaleMax);
      return sampleValueScale;
    },

    $_truncateViewDuration(viewDurationSec: number): number {
      viewDurationSec = Math.max(viewDurationSec, this.$_viewDurationMinSec);
      viewDurationSec = Math.min(viewDurationSec, this.$_viewDurationMaxSec);
      return viewDurationSec;
    },

    $_truncateViewTime(viewTimeSec: number): number {
      if (viewTimeMinSec !== undefined) {
        viewTimeSec = Math.max(viewTimeSec, viewTimeMinSec);
      }
      if (this.$_viewTimeMaxSec !== undefined) {
        viewTimeSec = Math.min(viewTimeSec, this.$_viewTimeMaxSec);
      }
      return viewTimeSec;
    },

    $_truncateTimeRange({ begin, end }: TimeRangeSecInterface): TimeRangeSecInterface {
      const durationSec = end - begin;
      if (this.$_viewTimeRangeSec.end <= end) {
        end = this.$_truncateViewTime(end);
        begin = this.$_truncateViewTime(end - durationSec);
      } else {
        begin = this.$_truncateViewTime(begin);
        end = this.$_truncateViewTime(begin + durationSec);
      }
      return { begin, end };
    },

    $_updateViewTimeRange(newViewTimeRangeSec: TimeRangeSecInterface): boolean {
      const { begin, end } = this.$_truncateTimeRange(newViewTimeRangeSec);
      if ((begin === this.$_viewTimeRangeSec.begin) && (end === this.$_viewTimeRangeSec.end)) {
        return false;
      }
      this.$_viewTimeRangeSec = new TimeRangeSec({ begin, end });
      return true;
    },

    $_getEventTimeSec(mouseEvent: MouseEvent): number | undefined {
      const elementClientX = this.$data.$_elementClientX;
      const eventTimeOffsetXFromViewBegin = (mouseEvent.clientX - elementClientX);
      return this.$_viewTimeRangeSec.begin + eventTimeOffsetXFromViewBegin * this.$_secPerPx;
    },

    $_offsetTimeSec(delta: number): boolean {
      let viewTimeOffsetSec = 0.001 * this.$_viewDurationSec * delta;
      return this.$_updateViewTimeRange({
        begin: this.$_viewTimeRangeSec.begin + viewTimeOffsetSec,
        end: this.$_viewTimeRangeSec.end + viewTimeOffsetSec,
      });
    },

    $_changeValueScale(delta: number) {
      this.$data.$_sampleValueScale = this.$_truncateValueScale(this.$data.$_sampleValueScale * Math.pow(1.003, -delta));
    },

    $_changeTimeScale(anchorTimeSec: number, delta: number): boolean {
      const scale = Math.pow(1.003, delta);
      let newDurationSec = this.$_viewDurationSec * scale;
      const viewTimeBeginOffsetFromAnchor = this.$_viewTimeRangeSec.begin - anchorTimeSec;
      const newViewTimeBeginSec = anchorTimeSec + viewTimeBeginOffsetFromAnchor * newDurationSec / this.$_viewDurationSec;
      const newViewTimeEndSec = newViewTimeBeginSec + this.$_truncateViewDuration(newDurationSec);
      return this.$_updateViewTimeRange({ begin: newViewTimeBeginSec, end: newViewTimeEndSec });
    },

    $_toggleAutoScroll() {
      this.$data.$_isAutoScrollEnabled = !this.$data.$_isAutoScrollEnabled;
    },
  },
});

export default AudioPlaytimeController;
</script>