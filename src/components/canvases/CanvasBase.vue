<script lang="ts">
import { Color, cl } from '../../modules/Color';

export default {
  watch: {
    color: {
      handler() { this.$_setDirty(true) },
      immediate: true,
    },
    '$data.$_isDirty': {
      handler(isDirty: boolean) { if (isDirty) this.$_draw() },
      immediate: true,
    },
  },

  mounted() {
    this.$nextTick(() => { this.$_draw() });
  },

  props: {
    color: { type: Color, default: cl.black },
  },

  data(): {
    $_isDirty: boolean,
    $_drawCallback?: (canvas: CanvasRenderingContext2D) => void,
  } {
    return {
      $_isDirty: false,
      $_drawCallback: undefined,
    };
  },

  computed: {
    $_staffLineStepPx(): number {
      return this.$store.state.config.staffLineStepPx;
    },

    $_canvasElement(): HTMLCanvasElement {
      return this.$el as HTMLCanvasElement;
    },
  },

  methods: {
    $_setDirty(isDirty: boolean) { this.$data.$_isDirty = isDirty },

    $_setCallback(drawCallback: (canvas: CanvasRenderingContext2D) => void) {
      this.$data.$_drawCallback = drawCallback;
    },

    $_setCanvasWidthPx(canvasWidthPx: number, setStyle: boolean = true) {
      if (setStyle) {
        this.$_canvasElement.style.width = `${canvasWidthPx}px`;
      }
      this.$_canvasElement.width = canvasWidthPx;
      this.$_setDirty(true);
    },

    $_setCanvasHeightPx(canvasHeightPx: number, setStyle: boolean = true) {
      if (setStyle) {
        this.$_canvasElement.style.height = `${canvasHeightPx}px`;
      }
      this.$_canvasElement.height = canvasHeightPx;
      this.$_setDirty(true);
    },

    $_draw() {
      if (!this.$data.$_isDirty) return;
      if (this.$data.$_drawCallback === undefined) return;

      let canvas = this.$_canvasElement.getContext('2d');
      if (canvas === null) return;
      canvas.beginPath();
      canvas.clearRect(0, 0, this.$_canvasElement.width, this.$_canvasElement.height);
      this.$data.$_drawCallback(canvas);
      this.$_setDirty(false);
    }
  }
}
</script>