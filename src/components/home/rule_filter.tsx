import { FunctionComponent, useState } from 'react';
import {
  EuiPanel,
  EuiHealth,
  EuiText,
  EuiIcon,
  EuiComboBox,
} from '@elastic/eui';
import { ruleFilterStyles } from './rule_filter.styles';
import { TagSummary } from '../../types';
import { ruleFilterTypeMap } from '../../lib/ruledata';

interface RuleFilterProps {
  tagList: TagSummary[];
  tagFilter: string[];
  displayName: string;
  icon: string;
  onTagChange: (type: string, selected: string[]) => void;
}

const RuleFilter: FunctionComponent<RuleFilterProps> = ({
  children,
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
      color: ruleFilterTypeMap[t.tag_type].color,
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
  /*
  return (
    <>
      <EuiText size="m">
        <p>
          <EuiIcon size="m" type={icon} css={styles.aligned} />
          <span css={styles.aligned}>{displayName}</span>
        </p>
      </EuiText>
      <EuiFlexGrid gutterSize="s" responsive={false} css={styles.grid}>
        {tagList.map((t, i) => {
          const isTagged = tagFilter.filter(x => x == t.tag_full).length > 0;
          let badgeTheme = ruleFilterTypeMap[t.tag_type] || {
            color: 'hollow',
          };
          if (!isTagged) {
            badgeTheme = { color: 'hollow' };
          }
          if (t.count == 0) {
            badgeTheme = { color: 'default' };
          }
          return (
            <EuiFlexItem key={i}>
              <EuiBadge
                color={badgeTheme.color}
                onClick={() => {
                  console.log(`${t.tag_full} ${isTagged}`);
                  if (isTagged) {
                    onTagChange([], [t.tag_full]);
                  } else {
                    onTagChange([t.tag_full], []);
                  }
                }}
                onClickAriaLabel={`Toggle tag for ${t.tag_full}`}>
                {t.tag_name} ({t.count})
              </EuiBadge>
            </EuiFlexItem>
          );
        })}
      </EuiFlexGrid>
    </>
  );*/
};

export default RuleFilter;
