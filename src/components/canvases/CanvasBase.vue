<script lang="ts">
import { Color, cl } from '../../modules/Color';

export default {
  watch: {
    color() { this.$_setDirty() },
  },

  created() {
    this.$store.dispatch('canvas/addCanvas', this);
  },

  mounted() {
    this.draw();
  },

  beforeUnmount() {
    this.$store.dispatch('canvas/removeCanvas', this);
  },

  props: {
    color: { type: Color, default: cl.black },
  },

  data(): {
    $_drawCallback?: (canvas: CanvasRenderingContext2D) => void,
  } {
    return {
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
    $_setDirty() {
      this.$store.dispatch('canvas/setDirty', this);
    },

    $_setCallback(drawCallback: (canvas: CanvasRenderingContext2D) => void) {
      this.$data.$_drawCallback = drawCallback;
    },

    $_setCanvasWidthPx(canvasWidthPx: number, setStyle: boolean = true) {
      if (setStyle) {
        this.$_canvasElement.style.width = `${canvasWidthPx}px`;
      }
      this.$_canvasElement.width = canvasWidthPx;
      this.$_setDirty();
    },

    $_setCanvasHeightPx(canvasHeightPx: number, setStyle: boolean = true) {
      if (setStyle) {
        this.$_canvasElement.style.height = `${canvasHeightPx}px`;
      }
      this.$_canvasElement.height = canvasHeightPx;
      this.$_setDirty();
    },

    draw() {
      if (this.$data.$_drawCallback === undefined) return;
      let canvas = this.$_canvasElement.getContext('2d');
      if (canvas === null) return;
      canvas.beginPath();
      canvas.clearRect(0, 0, this.$_canvasElement.width, this.$_canvasElement.height);
      this.$data.$_drawCallback(canvas);
    },
  }
}
</script>