import { FunctionComponent } from 'react';
import {
  EuiPanel,
  EuiHealth,
  EuiText,
  EuiIcon,
  EuiComboBox,
} from '@elastic/eui';
import { ruleFilterStyles } from './rule_filter.styles';
import { TagSummary } from '../../types';
import { TagTypeConfig } from '../../lib/tags';

interface RuleFilterProps {
  /** The taxonomy entry this control filters on: label, icon and colour. */
  tagType: TagTypeConfig;
  tagList: TagSummary[];
  tagFilter: string[];
  onTagChange: (type: string, selected: string[]) => void;
}

const RuleFilter: FunctionComponent<RuleFilterProps> = ({
  tagType,
  tagList,
  tagFilter,
  onTagChange,
}) => {
  const { displayName, icon } = tagType;
  const styles = ruleFilterStyles();

  const options = tagList.map(t => {
    return {
      value: t,
      label: `${t.tag_name} (${t.count})`,
      color: tagType.color,
    };
  });

  const selectedOptions = options.filter(o => {
    return tagFilter.includes(o.value.tag_full);
  });

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
          // Previously derived from tagList[0], which meant an empty list
          // passed '' -- and every tag "startsWith('')", so a change on an
          // empty filter would have cleared every other filter too.
          onTagChange(
            tagType.type,
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
