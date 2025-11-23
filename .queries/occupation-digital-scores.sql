-- Aggregate digital scores by occupation
-- Uses O*NET task importance (IM) and relevance (RT) weights
--
-- Formula: Σ(TaskDigital × IM × RT) / Σ(IM × RT)
--
-- This query calculates the weighted average digital score for each occupation
-- based on all tasks performed in that occupation, weighted by importance and relevance

SELECT
    JSONExtractString(data, 'onetCode') AS onetCode,
    JSONExtractString(data, 'occupationTitle') AS occupation,
    COUNT(DISTINCT id) AS taskCount,
    -- Weighted average using IM × RT
    SUM(
        toFloat64OrNull(JSONExtractString(data, 'digital')) *
        toFloat64OrNull(JSONExtractString(data, 'importance')) *
        toFloat64OrNull(JSONExtractString(data, 'relevance'))
    ) / SUM(
        toFloat64OrNull(JSONExtractString(data, 'importance')) *
        toFloat64OrNull(JSONExtractString(data, 'relevance'))
    ) AS digitalScore,
    -- Simple unweighted average for comparison
    AVG(toFloat64OrNull(JSONExtractString(data, 'digital'))) AS simpleAvgDigital,
    -- Count of tasks with scores
    countIf(JSONExtractString(data, 'digital') != '' AND JSONExtractString(data, 'digital') != 'null') AS scoredTaskCount
FROM things
WHERE
    type = 'Task'
    AND JSONExtractString(data, 'onetCode') != ''
    AND JSONExtractString(data, 'digital') IS NOT NULL
    AND JSONExtractString(data, 'digital') != 'null'
GROUP BY onetCode, occupation
HAVING scoredTaskCount > 0
ORDER BY digitalScore DESC
LIMIT 100
