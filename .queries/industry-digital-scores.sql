-- Industry digital scores aggregated from occupation mix
--
-- This requires BLS Industry-Occupation Employment Matrix data
-- Formula: Σ(OccupationDigitalScore × Employment) / TotalEmployment
--
-- Note: This query is a template - actual implementation depends on
-- having employment data in the things table or a separate source

-- Placeholder query showing industry from process data
SELECT
    JSONExtractString(data, 'industry') AS industry,
    COUNT(DISTINCT id) AS processCount,
    ROUND(AVG(toFloat64OrNull(JSONExtractString(data, 'digital'))), 3) AS avgDigitalScore,
    ROUND(MIN(toFloat64OrNull(JSONExtractString(data, 'digital'))), 3) AS minScore,
    ROUND(MAX(toFloat64OrNull(JSONExtractString(data, 'digital'))), 3) AS maxScore
FROM things
WHERE
    type = 'Process'
    AND JSONExtractString(data, 'digital') IS NOT NULL
    AND JSONExtractString(data, 'digital') != 'null'
    AND JSONExtractString(data, 'industry') != ''
GROUP BY industry
ORDER BY avgDigitalScore DESC
