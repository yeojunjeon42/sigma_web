// Where each portrait's head sits, as fractions of the image: its centre, the top of the hair, the chin.
export interface Face {
  x: number;
  top: number;
  chin: number;
}

export const FACES: Record<string, Face> = {
  "hwang-inseong": { x: 0.532, top: 0.155, chin: 0.505 },
  "song-heekyung": { x: 0.502, top: 0.076, chin: 0.606 },
  "jeon-yeojun": { x: 0.457, top: 0.166, chin: 0.594 },
  "jwa-heeju": { x: 0.628, top: 0.123, chin: 0.516 },
  "jeon-hyuntae": { x: 0.494, top: 0.217, chin: 0.418 },
  "lee-seunghyun": { x: 0.597, top: 0.135, chin: 0.559 },
};
