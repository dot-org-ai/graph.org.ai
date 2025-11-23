-- Top 20 most digital occupations
--
-- Shows occupations with highest weighted digital scores

SELECT
    JSONExtractString(data, 'onetCode') AS code,
    JSONExtractString(data, 'occupationTitle') AS occupation,
    ROUND(
        SUM(
            toFloat64OrNull(JSONExtractString(data, 'digital')) *
            toFloat64OrNull(JSONExtractString(data, 'importance')) *
            toFloat64OrNull(JSONExtractString(data, 'relevance'))
        ) / SUM(
            toFloat64OrNull(JSONExtractString(data, 'importance')) *
            toFloat64OrNull(JSONExtractString(data, 'relevance'))
        ), 3
    ) AS digitalScore,
    COUNT(*) AS tasks
FROM things
WHERE
    type = 'Task'
    AND JSONExtractString(data, 'digital') IS NOT NULL
    AND JSONExtractString(data, 'digital') != 'null'
GROUP BY code, occupation
HAVING tasks >= 5
ORDER BY digitalScore DESC
LIMIT 20
