export default interface FabAction {
    text: string;
    icon: any;
    onClick: (event?: any) => VoidFunction;
    loading?: boolean;
}
