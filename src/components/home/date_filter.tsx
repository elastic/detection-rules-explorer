import { FunctionComponent, ReactNode } from 'react';
import {
  EuiPanel,
  EuiText,
  EuiIcon,
  EuiComboBox,
} from '@elastic/eui';
import { ruleFilterStyles } from './rule_filter.styles';

export interface DateRangeOption {
  value: string;
  label: string;
  days: number | null;
}

export const dateRangeOptions: DateRangeOption[] = [
  { value: '7', label: 'Last week', days: 7 },
  { value: '14', label: 'Last 2 weeks', days: 14 },
  { value: '30', label: 'Last 30 days', days: 30 },
  { value: '90', label: 'Last 90 days', days: 90 },
  { value: '180', label: 'Last 6 months', days: 180 },
  { value: '365', label: 'Last year', days: 365 },
];

interface DateFilterProps {
  selectedValue: string | null;
  onChange: (value: string | null) => void;
  children?: ReactNode;
}

const DateFilter: FunctionComponent<DateFilterProps> = ({
  selectedValue,
  onChange,
}) => {
  const styles = ruleFilterStyles();

  const options = dateRangeOptions.map(o => ({
    value: o.value,
    label: o.label,
  }));

  const selectedOptions = options.filter(o => o.value === selectedValue);

  return (
    <EuiPanel css={styles.panel}>
      <EuiText size="m">
        <p>
          <EuiIcon size="m" type="calendar" css={styles.aligned} />
          <span css={styles.aligned}>Updated Date</span>
        </p>
      </EuiText>
      <EuiComboBox
        css={styles.combo}
        placeholder="Filter by update date"
        singleSelection={{ asPlainText: true }}
        options={options}
        selectedOptions={selectedOptions}
        isClearable={true}
        onChange={selected => {
          onChange(selected.length > 0 ? selected[0].value : null);
        }}
      />
    </EuiPanel>
  );
};

export default DateFilter;
