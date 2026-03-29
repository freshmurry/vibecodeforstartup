export const initialStages = [
    {
        id: 'bootstrap',
        title: 'Bootstrapping project',
        status: 'active',
    },
    {
        id: 'blueprint',
        title: 'Generating Blueprint',
        status: 'pending',
    },
    { id: 'code', title: 'Generating code', status: 'pending' },
    { id: 'validate', title: 'Reviewing & fixing code', status: 'pending' },
    { id: 'fix', title: 'Fixing issues', status: 'pending' },
];
/**
 * Update a specific stage's status and metadata
 */
export function updateStage(stages, stageId, updates) {
    return stages.map(stage => stage.id === stageId
        ? { ...stage, ...updates }
        : stage);
}
/**
 * Complete multiple stages at once
 */
export function completeStages(stages, stageIds) {
    return stages.map(stage => stageIds.includes(stage.id)
        ? { ...stage, status: 'completed' }
        : stage);
}
/**
 * Get the status of a specific stage
 */
export function getStageStatus(stages, stageId) {
    return stages.find(stage => stage.id === stageId)?.status;
}
/**
 * Check if a stage is completed
 */
export function isStageCompleted(stages, stageId) {
    return getStageStatus(stages, stageId) === 'completed';
}
