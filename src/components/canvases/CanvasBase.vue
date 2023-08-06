<script lang="ts">
import { Color, cl } from '../../modules/Color';

export default {
  watch: {
    color() { this.draw() },
  },

  mounted() {
    this.draw();
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
    $_setCallback(drawCallback: (canvas: CanvasRenderingContext2D) => void) {
      this.$data.$_drawCallback = drawCallback;
    },

    $_setCanvasWidthPx(canvasWidthPx: number, setStyle: boolean = true) {
      if (setStyle) {
        this.$_canvasElement.style.width = `${canvasWidthPx}px`;
      }
      this.$_canvasElement.width = canvasWidthPx;
      this.draw();
    },

    $_setCanvasHeightPx(canvasHeightPx: number, setStyle: boolean = true) {
      if (setStyle) {
        this.$_canvasElement.style.height = `${canvasHeightPx}px`;
      }
      this.$_canvasElement.height = canvasHeightPx;
      this.draw();
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