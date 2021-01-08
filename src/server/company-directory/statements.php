<?php

function query_edit($table, $array)
{
    return "UPDATE {$table} SET "
        . substr(
            array_reduce($array, function($carry, $item) { return $carry .= "{$item} = :{$item},"; }),
            0, -1) 
        . " WHERE id = :id";
}

function query_add($table, $array)
{
    return sprintf(
        "INSERT INTO {$table} (%s) values (%s)",
        implode(", ", $array),
        ":" . implode(", :", $array));
}

function query_all($table)
{
    return "SELECT * FROM {$table}";
}

function query_some($table)
{
    return "SELECT * FROM {$table} LIMIT :limit, :offset";
}

function query_delete($table)
{
    return "DELETE FROM {$table} WHERE id = :id";
}

function query_get($table)
{
    return "SELECT * FROM {$table} WHERE id = :id";
}

function getStatementOptions($method, $type)
{
    if ($method === "get")
    {
        switch ($type) {
            case "somePersonnel":
                return [
                    "sql" => query_some("personnel"),
                    "params" => [
                        "limit",
                        "offset"
                    ],
                    "types" => [
                        PDO::PARAM_INT,
                        PDO::PARAM_INT
                    ]
                ];
            case "allPersonnel":
                return [
                    "sql" => query_all("personnel"),
                    "params" => [],
                    "types" => []
                ];
            case "getPersonnel":
                return [
                    "sql" => query_get("personnel"),
                    "params" => ["id"],
                    "types" => [PDO::PARAM_INT]
                ];
            case "someDepartment":
                return [
                    "sql" => query_some("department"),
                    "params" => [
                        "limit",
                        "offset"
                    ],
                    "types" => [
                        PDO::PARAM_INT,
                        PDO::PARAM_INT
                    ]
                ];
            case "allDepartment":
                return [
                    "sql" => query_all("department"),
                    "params" => [],
                    "types" => []
                ];
            case "getDepartment":
                return [
                    "sql" => query_get("department"),
                    "params" => ["id"],
                    "types" => [PDO::PARAM_INT]
                ];
            case "someLocation":
                return [
                    "sql" => query_some("location"),
                    "params" => [
                        "limit",
                        "offset"
                    ],
                    "types" => [
                        PDO::PARAM_INT,
                        PDO::PARAM_INT
                    ]
                ];
            case "allLocation":
                return [
                    "sql" => query_all("location"),
                    "params" => [],
                    "types" => []
                ];
            case "getLocation":
                return [
                    "sql" => query_get("location"),
                    "params" => ["id"],
                    "types" => [PDO::PARAM_INT]
                ];
            default:
                return;
        };
    } else if ($method === "post")
    {
        switch ($type) {
            case "addPersonnel":
                $personnel = [
                    "firstName",
                    "lastName",
                    "jobTitle",
                    "email",
                    "departmentID"
                ];
                return [
                    "sql" => query_add("personnel", $personnel),
                    "params" => $personnel,
                    "types" => [
                        PDO::PARAM_STR,
                        PDO::PARAM_STR,
                        PDO::PARAM_STR,
                        PDO::PARAM_STR,
                        PDO::PARAM_INT
                    ]
                ];
            case "editPersonnel":
                $personnel = [
                    "id",
                    "firstName",
                    "lastName",
                    "jobTitle",
                    "email",
                    "departmentID"
                ];
                return [
                    "sql" => query_edit("personnel", $personnel),
                    "params" => $personnel,
                    "types" => [
                        PDO::PARAM_INT,
                        PDO::PARAM_STR,
                        PDO::PARAM_STR,
                        PDO::PARAM_STR,
                        PDO::PARAM_STR,
                        PDO::PARAM_INT
                    ]
                ];
            case "deletePersonnel":
                return [
                    "sql" => query_delete("personnel"),
                    "params" => ["id"],
                    "types" => [PDO::PARAM_INT]
                ];
            case "addDepartment":
                $department = [
                    "name",
                    "locationID"
                ];
                return [
                    "sql" => query_add("department", $department),
                    "params" => $department,
                    "types" => [
                        PDO::PARAM_STR,
                        PDO::PARAM_INT
                    ]
                ];
            case "editDepartment":
                $department = [
                    "id",
                    "name",
                    "locationID"
                ];
                return [
                    "sql" => query_edit("department", $department),
                    "params" => $department,
                    "types" => [
                        PDO::PARAM_INT,
                        PDO::PARAM_STR,
                        PDO::PARAM_INT
                    ]
                ];
            case "deleteDepartment":
                return [
                    "sql" => query_delete("department"),
                    "params" => ["id"],
                    "types" => [PDO::PARAM_INT]
                ];
            case "addLocation":
                $location = [
                    "name"
                ];
                return [
                    "sql" => query_add("location", $location),
                    "params" => $location,
                    "types" => [
                        PDO::PARAM_STR
                    ]
                ];
            case "editLocation":
                $location = [
                    "id",
                    "name"
                ];
                return [
                    "sql" => query_edit("location", $location),
                    "params" => $location,
                    "types" => [
                        PDO::PARAM_INT,
                        PDO::PARAM_STR
                    ]
                ];
            case "deleteLocation":
                return [
                    "sql" => query_delete("location"),
                    "params" => ["id"],
                    "types" => [PDO::PARAM_INT]
                ];
            default:
                return;
        };
    } else
    {
        return;
    }
}

?>