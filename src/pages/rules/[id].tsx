import { GetStaticPaths, GetStaticProps, InferGetStaticPropsType } from 'next';
import Head from 'next/head';
import { EuiFlexGroup, useEuiTheme } from '@elastic/eui';

import Wrapper from '../../components/home/wrapper';
import AboutPanel from '../../components/details/about_panel';
import DefinitionPanel from '../../components/details/definition_panel';
import InstallCallout from '../../components/details/install_callout';
import RuleHeader from '../../components/details/rule_header';
import { ruleDetailsStyles } from '../../components/details/rule_details.styles';
import { listRuleIds, readRule } from '../../lib/rules.server';
import { Rule } from '../../types';

export const getStaticPaths: GetStaticPaths = async () => ({
  paths: listRuleIds().map(id => ({ params: { id } })),
  fallback: false,
});

export const getStaticProps: GetStaticProps<{ rule: Rule }> = ({ params }) => {
  const id = params?.id;
  if (typeof id !== 'string') {
    // Unreachable: every path comes from getStaticPaths with fallback: false.
    throw new Error(`Expected a rule id, received ${JSON.stringify(params)}`);
  }
  return { props: { rule: readRule(id) } };
};

export default function RuleDetails({
  rule,
}: InferGetStaticPropsType<typeof getStaticProps>) {
  const { euiTheme } = useEuiTheme();
  const styles = ruleDetailsStyles(euiTheme);

  return (
    <>
      <Head>
        <title>{rule.rule.name}</title>
      </Head>

      <Wrapper>
        <RuleHeader rule={rule} />
        <EuiFlexGroup gutterSize="l" css={styles.container}>
          <AboutPanel rule={rule} />
          <DefinitionPanel rule={rule} />
        </EuiFlexGroup>
        <InstallCallout rule={rule} />
      </Wrapper>
    </>
  );
}
