import { FunctionComponent, ReactNode } from 'react';
import {
  EuiPanel,
  EuiHealth,
  EuiText,
  EuiIcon,
  EuiComboBox,
} from '@elastic/eui';
import { ruleFilterStyles } from './rule_filter.styles';
import { TagSummary } from '../../types';
import { tagTypeTheme } from '../../lib/tags';

interface RuleFilterProps {
  tagList: TagSummary[];
  tagFilter: string[];
  displayName: string;
  icon: string;
  onTagChange: (type: string, selected: string[]) => void;
  children?: ReactNode;
}

const RuleFilter: FunctionComponent<RuleFilterProps> = ({
  tagList,
  tagFilter,
  displayName,
  icon,
  onTagChange,
}) => {
  const styles = ruleFilterStyles();

  const options = tagList.map(t => {
    return {
      value: t,
      label: `${t.tag_name} (${t.count})`,
      color: tagTypeTheme(t.tag_type).color,
    };
  });

  const selectedOptions = options.filter(o => {
    return tagFilter.includes(o.value.tag_full);
  });

  const typeName = tagList.length > 0 ? tagList[0].tag_type : '';

  return (
    <EuiPanel css={styles.panel}>
      <EuiText size="m">
        <p>
          <EuiIcon size="m" type={icon} css={styles.aligned} />
          <span css={styles.aligned}>{displayName}</span>
        </p>
      </EuiText>
      <EuiComboBox
        css={styles.combo}
        placeholder={`Filter by ${
          options.filter(o => o.value.count > 0).length
        } ${displayName}`}
        options={options}
        selectedOptions={selectedOptions}
        isClearable={true}
        onChange={selected => {
          onTagChange(
            typeName,
            selected.map(o => o.value.tag_full)
          );
        }}
        renderOption={o => {
          return (
            <EuiHealth color={o.value.count > 0 ? o.color : '#eeeeee'}>
              {o.label}
            </EuiHealth>
          );
        }}
      />
    </EuiPanel>
  );
};

export default RuleFilter;
