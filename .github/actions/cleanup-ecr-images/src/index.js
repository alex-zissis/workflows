const core = require('@actions/core');
const github = require('@actions/github');
const {ECRClient, DescribeImagesCommand, BatchDeleteImageCommand} = require('@aws-sdk/client-ecr');
const client = new ECRClient();

(async () => {
    try {
        const repositoryName = core.getInput('ecr-repository-name');

        const describeCommand = new DescribeImagesCommand({repositoryName, maxResults: 1000});
        const describeResponse = await client.send(describeCommand);

        if (!describeResponse.imageDetails) {
            core.warning('Unable to query the repo. This may be a problem.');
            return;
        }

        const imagesInAscendingOrder = response.imageDetails.sort((a, b) =>
            a.imagePushedAt > b.imagePushedAt ? 1 : b.imagePushedAt > a.imagePushedAt ? -1 : 0
        );

        if (images > 2) {
            const imagesToDelete = imagesInAscendingOrder
                .slice(0, -2)
                .map((image) => ({imageDigest: `imageDigest=${image.imageDigest}`}));
            const deleteCommand = new BatchDeleteImageCommand({
                repositoryName,
                imageIds: imagesToDelete,
            });
            const deleteResponse = await client.send(deleteCommand);
            deleteResponse.failures.forEach(({imageId, failureCode, failureReason}) =>
                core.warning(`failed to delete ${imageId}: (${failureCode}) - ${failureReason}`)
            );
            core.log(`Successfully deleted ${deleteResponse.imageIds.length}`);
            deleteResponse.imageIds.forEach(({imageDigest, imageTag}) =>
                core.debug(`Deleted image: ${imageDigest} ${imageTag}`)
            );
        } else {
            core.log('Nothing to delete');
        }
    } catch (error) {
        core.setFailed(error.message);
    }
})();
