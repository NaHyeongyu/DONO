import styles from './ToggleSwitch.module.css';

type ToggleSwitchProps = {
  isOn: boolean;
  onToggle: () => void;
  label: string;
};

export default function ToggleSwitch({ isOn, onToggle, label }: ToggleSwitchProps) {
  return (
    <div className={styles.container}>
      <span className={styles.label}>{label}</span>
      <label className={styles.switch}>
        <input type="checkbox" checked={isOn} onChange={onToggle} className={styles.checkbox} />
        <span className={styles.slider}></span>
      </label>
    </div>
  );
}
