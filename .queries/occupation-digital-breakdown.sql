-- Digital score breakdown for a specific occupation
-- Shows all tasks with their individual scores and weights
--
-- Usage: Replace '15-1252.00' with desired O*NET code

SELECT
    id,
    JSONExtractString(data, 'task') AS task,
    ROUND(toFloat64OrNull(JSONExtractString(data, 'digital')), 2) AS digital,
    ROUND(toFloat64OrNull(JSONExtractString(data, 'importance')), 1) AS importance,
    ROUND(toFloat64OrNull(JSONExtractString(data, 'relevance')), 1) AS relevance,
    ROUND(
        toFloat64OrNull(JSONExtractString(data, 'digital')) *
        toFloat64OrNull(JSONExtractString(data, 'importance')) *
        toFloat64OrNull(JSONExtractString(data, 'relevance')), 2
    ) AS weightedScore
FROM things
WHERE
    type = 'Task'
    AND JSONExtractString(data, 'onetCode') = '15-1252.00'  -- Software Developers
    AND JSONExtractString(data, 'digital') IS NOT NULL
ORDER BY weightedScore DESC
