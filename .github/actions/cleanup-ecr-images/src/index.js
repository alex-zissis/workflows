import core from '@actions/core';
import github from '@actions/github';
import {ECRClient, DescribeImagesCommand, BatchDeleteImageCommand} from '@aws-sdk/client-ecr';

const client = new ECRClient({});

(async () => {
    try {
        const repositoryName = core.getInput('ecr-repository-name');

        const describeCommand = new DescribeImagesCommand({repositoryName, maxResults: 1000});
        const describeResponse = await client.send(describeCommand);

        if (!describeResponse.imageDetails) {
            core.warning('Unable to query the repo. This may be a problem.');
            return;
        }

        const imagesInAscendingOrder = describeResponse.imageDetails.sort((a, b) =>
            a.imagePushedAt > b.imagePushedAt ? 1 : b.imagePushedAt > a.imagePushedAt ? -1 : 0
        );

        if (imagesInAscendingOrder.length > 2) {
            const imagesToDelete = imagesInAscendingOrder
                .slice(0, -2)
                .map(({imageDigest}) => ({imageDigest}));
            const deleteCommand = new BatchDeleteImageCommand({
                repositoryName,
                imageIds: imagesToDelete,
            });
            const deleteResponse = await client.send(deleteCommand);
            deleteResponse.failures.forEach(({imageId, failureCode, failureReason}) =>
                core.warning(`failed to delete ${imageId}: (${failureCode}) - ${failureReason}`)
            );
            core.info(`Successfully deleted ${deleteResponse.imageIds.length}`);
            deleteResponse.imageIds.forEach(({imageDigest, imageTag}) =>
                core.debug(`Deleted image: ${imageDigest} ${imageTag}`)
            );
        } else {
            core.info('Nothing to delete');
        }
    } catch (error) {
        core.setFailed(error.message);
    }
})();
