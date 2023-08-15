// Script to generate a new build number
// Relies on the fact that github.run_number is reset when the workflow file name changes
// This is why the version pattern is included in the file name

const workflowRef = process.argv[2];
if (!workflowRef) {
	process.stderr.write(
		'Expected first parameter `github.workflow_ref` e.g. octocat/hello-world/.github/workflows/my-workflow-1.0.x.yml@refs/heads/my_branch'
	);
	console.error(
		'See: https://docs.github.com/en/actions/learn-github-actions/contexts#github-context'
	);

	process.exit(1);
}

const runNumber = process.argv[3];
if (!runNumber) {
	console.error('Expected second parameter `github.run_number` e.g. 1');
	console.error(
		'See: https://docs.github.com/en/actions/learn-github-actions/contexts#github-context'
	);

	process.exit(1);
}

const workflowFileNameWithExtension = workflowRef.split('@')[0]?.split('/').reverse()[0];
const workflowFileName = workflowFileNameWithExtension.replace('.yml', '');
const versionPattern = workflowFileName.split('-').reverse()[0];
const newVersionNumber = versionPattern.replace('x', runNumber);
console.log(`NEW_VERSION_NUMBER=${newVersionNumber}`);
