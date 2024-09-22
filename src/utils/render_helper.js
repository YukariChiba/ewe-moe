import { MathUtils, Object3D, Vector3, Color } from "three";
const { randFloat: rnd, randFloatSpread: rndFS, randInt } = MathUtils;
import niceColors from "../data/colors";

function point_size_rand(cfg) {
  const sizecfg = cfg.point.sizes;
  let size = 0;
  let rank = 0;
  while (sizecfg[rank] && sizecfg[rank].randgt < size) {
    size = rnd(sizecfg[rank].rand[0], sizecfg[rank].rand[1]);
    rank++;
  }
  return size;
}

function point_position_rand(cfg) {
  const v3 = new Vector3();
  v3.set(
    rndFS(cfg.point.positions[0]),
    rndFS(cfg.point.positions[1]),
    rndFS(cfg.point.positions[2])
  );
  return v3;
}

function point_color_rand(cfg, custom_palette = null) {
  let palette = niceColors[cfg.point.default_palette];
  if (custom_palette != null) {
    if (custom_palette >= 0) palette = niceColors[custom_palette];
    if (custom_palette === -1)
      palette = niceColors[randInt(0, niceColors.length - 1)];
  }
  const color = new Color();
  color.set(palette[Math.floor(rnd(0, palette.length))]);
  return color;
}

function time_coef_update(cfg, event, coef) {
  if (coef != cfg.time.coef_max)
    return Math.min(
      Math.pow(
        4 *
          (1 -
            Math.abs(event.clientX - window.innerWidth / 2) /
              (window.innerWidth / 2)),
        2
      ) +
        Math.pow(
          4 *
            (1 -
              Math.abs(event.clientY - window.innerHeight / 2) /
                (window.innerHeight / 2)),
          2
        ),
      25
    );
  else return coef;
}

function rotation_update(obj, x, y, coef = 1.0) {
  if (obj) obj.rotation.set(x * coef, y * coef, 0);
}

function object_matrix_update(obj, idx, position, scale, lookat = null) {
  const dummyO = new Object3D();
  dummyO.scale.set(scale[0], scale[1], scale[2]);
  dummyO.position.copy(position);
  if (lookat) dummyO.lookAt(lookat);
  dummyO.updateMatrix();
  obj.setMatrixAt(idx, dummyO.matrix);
}

function vector_rand(pos, dpos = [0, 0, 0]) {
  return new Vector3(
    rndFS(pos[0]) + dpos[0],
    rndFS(pos[1]) + dpos[1],
    rndFS(pos[2]) + dpos[2]
  );
}

export {
  point_size_rand,
  point_position_rand,
  point_color_rand,
  time_coef_update,
  rotation_update,
  object_matrix_update,
  vector_rand,
};
