function replaceNullsByEmptyString(value: any) {
    return (value == null) ? "" : value
}

export const getUrlParameter = (sParam: any) => {
    let sPageURL = window.location.search.substring(1),
        sURLVariables = sPageURL.split('&'),
        sParameterName,
        i;
    for (i = 0; i < sURLVariables.length; i++) {
        sParameterName = sURLVariables[i].split('=');
        if (sParameterName[0].toLowerCase() === sParam) {
            return (sParameterName[1] === undefined || replaceNullsByEmptyString(sParameterName[1]) === "") ? false : decodeURIComponent(sParameterName[1]);
        }
    }
}

export const formatDate = (date: any) => {
    if (!date) return '';
    const dateObj = typeof date === "string" ? new Date(date) : date;
    return dateObj.toISOString().split('T')[0]
}

export const formatDateFromString = (
    dateString: string,
    toSharePointFormat: boolean = false
): string => {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return ''; // Invalid date fallback

    const yyyy = date.getFullYear();
    const pad = (num: number): string => (num < 10 ? '0' + num : '' + num);
    const mm = pad(date.getMonth() + 1);
    const dd = pad(date.getDate());

    if (toSharePointFormat) {
        // SharePoint expects ISO 8601
        return `${yyyy}-${mm}-${dd}T00:00:00Z`;
    }

    // Default: simple YYYY-MM-DD
    return `${yyyy}-${mm}-${dd}`;
};
export const getCurrentDate = (day?: number): string => {
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = today.getMonth() + 1;

    const selectedDay = (day && day >= 1 && day <= 31) ? day : today.getDate();

    const pad = (num: number): string => (num < 10 ? '0' + num : '' + num);
    return `${yyyy}-${pad(mm)}-${pad(selectedDay)}`;
};