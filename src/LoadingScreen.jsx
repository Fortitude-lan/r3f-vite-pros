/*
 * @Descripttion: 
 * @version: Antares
 * @Author: 
 * @Date: 2024-07-04 13:45:44
 * @LastEditors: Chevalier
 * @LastEditTime: 2024-08-15 08:06:49
 */
import { useProgress } from "@react-three/drei";

export default function LoadingScreen() {
  const { progress, active } = useProgress();

  return (
    <div className={`loading-screen ${active ? "" : "loading-screen--hidden"}`}>
      <div className="loading-screen__container">
        <h1 className="loading-screen__title">3D Web Loading</h1>
        <div className="jlq"></div>
        <div className="progress__container">
          <div
            className="progress__bar"
            style={{ width: `${progress}%` }}
          ></div>
        </div>
      </div>
    </div>
  );
}
