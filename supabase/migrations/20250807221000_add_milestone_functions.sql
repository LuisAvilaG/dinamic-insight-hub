-- Function to get the most viewed report in the last 30 days
CREATE OR REPLACE FUNCTION get_most_viewed_report()
RETURNS TABLE (nombre_reporte TEXT, departamento_reporte TEXT, view_count BIGINT)
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    SELECT
        r.nombre AS nombre_reporte,
        r.departamento AS departamento_reporte,
        COUNT(rv.id) AS view_count
    FROM
        public.report_views rv
    JOIN
        public.reportes r ON rv.report_id = r.id
    WHERE
        rv.viewed_at >= NOW() - INTERVAL '30 days'
    GROUP BY
        r.id, r.nombre, r.departamento
    ORDER BY
        view_count DESC
    LIMIT 1;
END;
$$;

-- Function to get the day with the most unique user logins in the last 30 days
CREATE OR REPLACE FUNCTION get_peak_user_day()
RETURNS TABLE (login_day DATE, user_count BIGINT)
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    SELECT
        DATE(login_at) AS login_day,
        COUNT(DISTINCT user_id) AS user_count
    FROM
        public.user_logins
    WHERE
        login_at >= NOW() - INTERVAL '30 days'
    GROUP BY
        login_day
    ORDER BY
        user_count DESC
    LIMIT 1;
END;
$$;
