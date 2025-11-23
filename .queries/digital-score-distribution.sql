-- Distribution of digital scores across all tasks
--
-- Shows histogram of digital scores to understand the overall distribution

SELECT
    ROUND(toFloat64OrNull(JSONExtractString(data, 'digital')), 1) AS scoreRange,
    COUNT(*) AS taskCount,
    bar(COUNT(*), 0, (SELECT MAX(c) FROM (
        SELECT COUNT(*) as c FROM things
        WHERE type = 'Task' AND JSONExtractString(data, 'digital') IS NOT NULL
        GROUP BY ROUND(toFloat64OrNull(JSONExtractString(data, 'digital')), 1)
    )), 50) AS distribution
FROM things
WHERE
    type = 'Task'
    AND JSONExtractString(data, 'digital') IS NOT NULL
    AND JSONExtractString(data, 'digital') != 'null'
GROUP BY scoreRange
ORDER BY scoreRange
