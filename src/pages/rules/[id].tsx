import { InferGetStaticPropsType, GetStaticProps, GetStaticPaths } from 'next';
import Head from 'next/head';
import { EuiSpacer, useEuiTheme } from '@elastic/eui';
import {
  EuiText,
  EuiDescriptionList,
  EuiFlexGroup,
  EuiFlexItem,
  EuiTitle,
  EuiBadge,
  EuiPanel,
  EuiCodeBlock,
  EuiLink,
  EuiHealth,
  EuiCallOut,
} from '@elastic/eui';
import moment from 'moment';
import * as fs from 'fs';
import * as path from 'path';

import Wrapper from '../../components/home/wrapper';
import { ruleDetailsStyles } from '../../components/details/rule_details.styles';
import { ruleFilterTypeMap } from '../../lib/ruledata';

const RULES_OUTPUT_PATH = '../../../../src/data/rules/';

export const getStaticPaths: GetStaticPaths = async () => {
  const ids = fs.readdirSync(path.join(__dirname, RULES_OUTPUT_PATH));
  return {
    paths: ids.map(x => {
      console.log(path.parse(x).name);
      return {
        params: {
          id: path.parse(x).name,
        },
      };
    }),
    fallback: false,
  };
};

export const getStaticProps: GetStaticProps<{
  rule;
}> = ({ params }) => {
  const res = JSON.parse(
    fs.readFileSync(
      path.join(__dirname, `${RULES_OUTPUT_PATH}${params.id}.json`),
      'utf8'
    )
  );
  return { props: { rule: res } };
};

export default function RuleDetails({
  rule,
}: InferGetStaticPropsType<typeof getStaticProps>) {
  const { euiTheme } = useEuiTheme();
  const styles = ruleDetailsStyles(euiTheme);

  const ruleCreated =
    rule.metadata.creation_date &&
    moment(rule.metadata.creation_date.replace(/\//g, '-'));
  const ruleUpdated =
    rule.metadata.updated_date &&
    moment(rule.metadata.updated_date.replace(/\//g, '-'));

  const aboutItems = [
    {
      title: 'Tags',
      description: rule.rule.tags.map((t, i) => {
        if (t.startsWith('Resources')) {
          return <></>;
        }
        const badgeTheme = ruleFilterTypeMap[t.split(': ')[0]] || {
          color: 'hollow',
          icon: '',
        };
        return (
          <EuiBadge
            iconType={badgeTheme.icon}
            color={badgeTheme.color}
            css={styles.badge}
            key={i}>
            {t}
          </EuiBadge>
        );
      }),
    },
    {
      title: 'Severity',
      description: (() => {
        let status = 'subdued';
        if (rule.rule.severity == 'medium') {
          status = 'warning';
        }
        if (rule.rule.severity == 'high') {
          status = 'danger';
        }
        return <EuiHealth color={status}>{rule.rule.severity}</EuiHealth>;
      })(),
    },
    {
      title: 'Risk Score',
      description: rule.rule.risk_score,
    },
    {
      title: 'References',
      description:
        rule.rule.reference &&
        rule.rule.reference.map((x, i) => (
          <EuiLink key={i} target="_blank" href={x}>
            {x}
          </EuiLink>
        )),
    },
    {
      title: 'MITRE ATT&CK™',
      description:
        rule.rule.threat &&
        rule.rule.threat.map((x, i) => (
          <p key={i}>
            <EuiLink target="_blank" href={x.tactic.reference}>
              {x.tactic.name} ({x.tactic.id})
            </EuiLink>
            {x.technique &&
              x.technique.map((t, j) => (
                <EuiText key={j} size="xs">
                  <p>
                    <EuiLink target="_blank" href={t.reference}>
                      ↳ {t.name} ({t.id})
                    </EuiLink>
                  </p>
                </EuiText>
              ))}
            <EuiSpacer size="xs" />
          </p>
        )),
    },
    {
      title: 'False Positive Examples',
      description: rule.rule.false_positives,
    },
    {
      title: 'License',
      description: (
        <EuiLink
          href="https://www.elastic.co/licensing/elastic-license"
          target="_blank">
          Elastic License v2
        </EuiLink>
      ),
    },
  ].filter(x => x.description);

  const packName =
    rule.metadata.source_integration_name ||
    'Prebuilt Security Detection Rules';
  const packLink = rule.metadata.source_integration
    ? `https://docs.elastic.co/en/integrations/${rule.metadata.source_integration}`
    : `https://www.elastic.co/guide/en/security/current/prebuilt-rules-management.html`;

  const definitionItems = [
    {
      title: 'Rule Type',
      description: (() => {
        switch (rule.rule.type) {
          case 'query':
            if (rule.rule.language == 'kuery') {
              return 'Query (Kibana Query Language)';
            }
          case 'eql':
            return 'Event Correlation Rule';
          case 'threshold':
            return 'Threshold Rule';
          case 'threat_match':
            return 'Threat Match Rule';
          case 'new_terms':
            return 'New Terms Rule';
          case 'machine_learning':
            return 'Machine Learning';
        }
      })(),
    },
    {
      title: 'Integration Pack',
      description: packName,
    },
    {
      title: 'Index Patterns',
      description:
        rule.rule.index &&
        rule.rule.index.map((x, i) => (
          <EuiBadge key={i} color="hollow">
            {x}
          </EuiBadge>
        )),
    },
    {
      title: 'Related Integrations',
      description: [
        ...(Array.isArray(rule.metadata.integration)
          ? rule.metadata.integration
          : [rule.metadata.integration]),
      ].map((x, i) => (
        <p key={i}>
          <EuiLink
            target="_blank"
            href={`https://docs.elastic.co/en/integrations/${x}`}>
            {x}
          </EuiLink>
        </p>
      )),
    },
    {
      title: 'Query',
      description: '',
    },
  ].filter(x => x.title == 'Query' || x.description);

  return (
    <>
      <Head>
        <title>Home</title>
      </Head>

      <Wrapper>
        <EuiFlexGroup css={styles.container}>
          <EuiFlexItem>
            <EuiPanel grow={true}>
              <EuiTitle size="m">
                <h1>{rule.rule.name}</h1>
              </EuiTitle>
              <EuiSpacer size="s" />
              <EuiText color="subdued" size="s">
                Last updated {ruleUpdated.fromNow()} on{' '}
                {ruleUpdated.format('YYYY-MM-DD')}
              </EuiText>
              {ruleCreated && (
                <EuiText color="subdued" size="s">
                  Created {ruleCreated.fromNow()} on{' '}
                  {ruleCreated.format('YYYY-MM-DD')}
                </EuiText>
              )}
            </EuiPanel>
          </EuiFlexItem>
        </EuiFlexGroup>
        <EuiFlexGroup css={styles.container}>
          <EuiFlexItem>
            <EuiPanel>
              <EuiTitle size="m">
                <h1>About</h1>
              </EuiTitle>
              <EuiSpacer size="l" />
              <EuiText>{rule.rule.description}</EuiText>
              <EuiSpacer size="l" />
              <EuiDescriptionList
                type="column"
                listItems={aboutItems}
                css={styles.list}
              />
            </EuiPanel>
          </EuiFlexItem>
          <EuiFlexItem>
            <EuiPanel>
              <EuiTitle size="m">
                <h1>Definition</h1>
              </EuiTitle>
              <EuiSpacer size="l" />
              <EuiDescriptionList
                type="column"
                listItems={definitionItems}
                css={styles.list}
              />
              <EuiSpacer size="m" />
              <EuiCodeBlock>{rule.rule.query}</EuiCodeBlock>
            </EuiPanel>
          </EuiFlexItem>
        </EuiFlexGroup>
        <EuiCallOut
          size="m"
          title={'Install detection rules in Elastic Security'}
          iconType="logoElastic"
          css={styles.callout}>
          <EuiSpacer size="s" />
          <p>
            Detect {rule.rule.name} in the Elastic Security detection engine by
            installing this rule into your Elastic Stack.
          </p>
          <p>
            To setup this rule, check out the installation guide for{' '}
            <EuiLink target="_blank" href={packLink}>
              {packName}
            </EuiLink>
            .
          </p>
        </EuiCallOut>
      </Wrapper>
    </>
  );
}
