export function makeUrl(res: string) {
    const onGithub = window.location.hostname.indexOf('github') >= 0;
    let path = res;
    if (onGithub) path = '/The-Fkn-Factory' + path;
    return path;
}