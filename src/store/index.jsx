import { create } from 'zustand'
import * as THREE from 'three'

export const useTerrainGeometry = create((set) => ({
  data: undefined,
  setData: (v) =>
    set({
      data: v,
    }),
}))