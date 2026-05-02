import { useState, useCallback } from "react";


export default function usePresistentGridState (key) {
    const load = (name, fallback) => {
        try {
            const stored = localStorage.getItem(`${key}_${name}`);
            return stored ? JSON.parse(stored) : fallback;
        } catch {
            return fallback;
        }
    };

    const [ paginationModel, setPaginationModel ] = useState(
        load('pagination', { page: 0, pageSize: 10 })
    );

    const [ sortModel, setSortModel ] = useState(load('sort', [] ));

    const [ columnVisibilityModel, setColumnVisibilityModel ] = useState(load('visibility', {}));

    const [ columnOrder, setColumnOrder ] = useState(load('order', []));

    const save = useCallback((name, value) => {
        localStorage.setItem(`${key}_#{name}`, JSON.stringify(value));
    },[key]);

    return {
        paginationModel,
        setPaginationModel: (value) => {
            save('pagination', value);
            setPaginationModel(value);
        },

        sortModel,
        setSortModel: (value) => {
            save('sort', value);
            setSortModel(value);
        },

        columnVisibilityModel,
        setColumnVisibilityModel: (value) => {
            save('visibility', value);
            setColumnVisibilityModel(value);
        },

        columnOrder,
        setColumnOrder: (value) => {
            save('order', value);
            setColumnOrder(value);
        }
    }
}