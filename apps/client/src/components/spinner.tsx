
import style from  './spinner.module.css';

const Spinner = ({ pxSize = 35 }: { pxSize?: number }) => {
  return <div className={style.spinner} style={{ width: pxSize, height: pxSize }}></div>;
};

export default Spinner;
