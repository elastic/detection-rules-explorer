import * as tar from 'tar';
import { PassThrough } from 'stream';

import * as toml from 'toml';
import * as fs from 'fs';
import axios from 'axios';

interface RuleSummary {
  id: string;
  name: string;
  tags: Array<string>;
  updated_date: Date;
}

interface TagSummary {
  tag_type: string;
  tag_name: string;
  tag_full: string;
  count: number;
}

function addTagSummary(t: string, tagSummaries: Map<string, TagSummary>) {
  const parts = t.split(': ');
  let s = tagSummaries.get(t);
  if (s == undefined) {
    s = {
      tag_type: parts[0],
      tag_name: parts[1],
      tag_full: t,
      count: 0,
    };
  }
  s.count++;
  tagSummaries.set(t, s);
}

const RULES_OUTPUT_PATH = './src/data/rules/';

async function getPrebuiltDetectionRules(
  ruleSummaries: RuleSummary[],
  tagSummaries: Map<string, TagSummary>
) {
  let count = 0;
  type Technique = {
    id: string;
    reference: string;
    subtechnique?: { id: string; reference: string }[];
  };
  
  type Tactic = {
    id: string;
    reference: string;
  };
  
  type Threat = {
    framework: string;
    technique?: Technique[];
    tactic?: Tactic;
  };
    
  const convertHuntMitre = function (mitreData: string[]): Threat[] {
    const threat: Threat[] = [];
  
    mitreData.forEach((item) => {
      if (item.startsWith('TA')) {
        threat.push({
          framework: "MITRE ATT&CK",
          tactic: {
            id: item,
            reference: `https://attack.mitre.org/tactics/${item}/`,
          },
        });
      } else if (item.startsWith('T')) {
        const parts = item.split('.');
        const techniqueId = parts[0];
        const subtechniqueId = parts[1];
    
        const technique: Technique = {
          id: techniqueId,
          reference: `https://attack.mitre.org/techniques/${techniqueId}/`,
        };
    
        if (subtechniqueId) {
          technique.subtechnique = [
            {
              id: `${techniqueId}.${subtechniqueId}`,
              reference: `https://attack.mitre.org/techniques/${techniqueId}/${subtechniqueId}/`,
            },
          ];
        }
    
        threat.push({
          framework: "MITRE ATT&CK",
          technique: [technique],
        });
      }
    });
  
    return threat;
  };

  const addRule = function (buffer) {
    const ruleContent = toml.parse(buffer);
  
    // Check if ruleContent.rule and ruleContent.hunt exist
    const ruleId = ruleContent.rule?.rule_id || ruleContent.hunt?.uuid;
  
    if (!ruleId) {
      throw new Error('Neither rule_id nor hunt.uuid is available');
    }
  
    // Use default tags if ruleContent.rule.tags does not exist
    const tags = ruleContent.rule?.tags || ["Hunt Type: Hunt"];
  
    // Add default tags to ruleContent.rule.tags if it does not exist
    if (!ruleContent.rule?.tags) {
      ruleContent.rule = {
        ...ruleContent.rule,
        tags: ["Hunt Type: Hunt"],
      };
    }
  
    // Add creation_date if it does not exist
    if (!ruleContent.metadata?.creation_date) {
      ruleContent.metadata = {
        ...ruleContent.metadata,
        creation_date: new Date(0).toISOString(),
      };
    }
  
    // Add updated_date if it does not exist
    if (!ruleContent.metadata?.updated_date) {
      ruleContent.metadata = {
        ...ruleContent.metadata,
        updated_date: new Date(0).toISOString(),
      };
    }
  
    // Use current date as default updated_date if it does not exist
    const updatedDate = new Date(ruleContent.metadata.updated_date.replace(/\//g, '-'));
  
    // Use hunt.name if rule.name does not exist
    const ruleName = ruleContent.rule?.name || ruleContent.hunt?.name || 'Unknown Rule';
  
    // Set ruleContent.metadata.integration if it does not exist
    if (!ruleContent.metadata?.integration && ruleContent.hunt?.integration) {
      ruleContent.metadata = {
        ...ruleContent.metadata,
        integration: ruleContent.hunt.integration,
      };
    }
  
    // Set ruleContent.rule.query if it does not exist
    if (!ruleContent.rule?.query && ruleContent.hunt?.query) {
      ruleContent.rule = {
        ...ruleContent.rule,
        query: ruleContent.hunt.query,
      };
    }
  
    // Set ruleContent.rule.license to "Elastic License v2" if it does not exist
    if (!ruleContent.rule?.license) {
      ruleContent.rule = {
        ...ruleContent.rule,
        license: "Elastic License v2",
      };
    }
  
    // Set ruleContent.rule.description if it does not exist
    if (!ruleContent.rule?.description && ruleContent.hunt?.description) {
      ruleContent.rule = {
        ...ruleContent.rule,
        description: ruleContent.hunt.description,
      };
    }
  
    ruleSummaries.push({
      id: ruleId,
      name: ruleName,
      tags: tags,
      updated_date: updatedDate,
    });
  
    for (const t of tags) {
      addTagSummary(t, tagSummaries);
    }
  
    fs.writeFileSync(
      `${RULES_OUTPUT_PATH}${ruleId}.json`,
      JSON.stringify(ruleContent)
    );
  
    count++;
  };

  const githubRulesTarballUrl =
    'https://api.github.com/repos/elastic/detection-rules/tarball';
  const res = await axios.get(githubRulesTarballUrl, {
    responseType: 'stream',
  });
  const parser = res.data.pipe(new tar.Parse());
  parser.on('entry', entry => {
    if (
      (entry.path.match(/^elastic-detection-rules-.*\/rules\/.*\.toml$/) ||
      entry.path.match(/^elastic-detection-rules-.*\/hunting\/.*\.toml$/) ||
        entry.path.match(
          /^elastic-detection-rules-.*\/rules_building_block\/.*\.toml$/
        )) &&
      !entry.path.match(/\/_deprecated\//)
    ) {
      const contentStream = new PassThrough();
      entry.pipe(contentStream);
      let buf = Buffer.alloc(0);
      contentStream.on('data', function (d) {
        buf = Buffer.concat([buf, d]);
      });
      contentStream.on('end', () => {
        addRule(buf);
      });
    } else {
      entry.resume();
    }
  });
  await new Promise(resolve => parser.on('finish', resolve));

  console.log(`loaded ${count} rules from prebuilt repository`);
}

const integrationsTagMap = new Map<string, string>([
  ['Living off the Land', 'Tactic: Defensive Evasion'],
  ['DGA', 'Tactic: Command and Control'],
  ['Lateral Movement Detection', 'Tactic: Lateral Movement'],
  ['Data Exfiltration', 'Tactic: Exfiltration'],
  ['Host', 'Domain: Endpoint'],
  ['User', 'Domain: User'],
  ['ML', 'Rule Type: Machine Learning'],
]);

async function getPackageRules(
  name: string,
  displayName: string,
  ruleSummaries: RuleSummary[],
  tagSummaries: Map<string, TagSummary>
) {
  const githubRulesListUrl = `https://api.github.com/repos/elastic/integrations/contents/packages/${name}/kibana/security_rule`;
  const githubRulesCommitsUrl = `https://api.github.com/repos/elastic/integrations/commits?path=packages%2F${name}%2Fkibana%2Fsecurity_rule&page=1&per_page=1`;

  const rulesCommitsResponse = await axios.get(githubRulesCommitsUrl);
  const updatedDate = new Date(
    rulesCommitsResponse.data[0].commit.committer.date
  );
  const ruleListResponse = await axios.get(githubRulesListUrl);

  for (const r of ruleListResponse.data) {
    const ruleContent = await axios.get(r.download_url);

    const tags = ruleContent.data.attributes.tags
      .filter(x => x != 'Elastic')
      .map(x => {
        if (integrationsTagMap.has(x)) {
          return integrationsTagMap.get(x);
        } else {
          return x;
        }
      });
    tags.push('Use Case: Threat Detection');

    // for now, map the tags to look more like the prebuild rules package
    ruleSummaries.push({
      id: ruleContent.data.id,
      name: ruleContent.data.attributes.name,
      tags: tags,
      updated_date: updatedDate,
    });
    for (const t of tags) {
      addTagSummary(t, tagSummaries);
    }
    const mappedRuleContent = {
      metadata: {
        updated_date: updatedDate,
        source_integration: name,
        source_integration_name: displayName,
      },
      rule: ruleContent.data.attributes,
    };
    mappedRuleContent.rule.tags = tags;
    fs.writeFileSync(
      `${RULES_OUTPUT_PATH}${ruleContent.data.id}.json`,
      JSON.stringify(mappedRuleContent)
    );
  }
  console.log(
    `loaded ${ruleListResponse.data.length} rules from integration package '${name}'`
  );
}

async function precomputeRuleSummaries() {
  const ruleSummaries: RuleSummary[] = [];

  const tagSummaries = new Map<string, TagSummary>();

  fs.mkdirSync(RULES_OUTPUT_PATH, { recursive: true });

  await getPrebuiltDetectionRules(ruleSummaries, tagSummaries);

  console.log(`loaded ${ruleSummaries.length} rules`);
  console.log(`example rule:`);
  console.log(ruleSummaries[0]);
  console.log(`found ${tagSummaries.size} tags`);
  console.log(`example tag:`);
  console.log(tagSummaries.get('Data Source: APM'));

  const newestRules = ruleSummaries.sort(
    (a, b) => b.updated_date.getTime() - a.updated_date.getTime()
  );
  console.log(
    `Parsed ${newestRules.length} rules. Newest rule is '${newestRules[0].name}', updated '${newestRules[0].updated_date}'.`
  );

  fs.writeFileSync('./src/data/newestRules.json', JSON.stringify(newestRules));

  const popularTags = Array.from(tagSummaries.values()).sort(
    (a, b) => b.count - a.count
  );
  console.log(
    `Parsed ${popularTags.length} tags. Most popular tag is '${popularTags[0].tag_full}' with '${popularTags[0].count}' rules.`
  );

  fs.writeFileSync('./src/data/tagSummaries.json', JSON.stringify(popularTags));
}

(async () => {
  await precomputeRuleSummaries();
})();
