import { computed } from 'vue';

export const useTestId = (props: { dataTestid?: string }, componentName: string) => {
  return computed(() => {
    if (props.dataTestid) return props.dataTestid;

    const randomSuffix = Math.random().toString(36).substring(2, 8);

    return `${ componentName }-${ randomSuffix }`.toLowerCase();
  });
};
