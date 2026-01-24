
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog"

interface DeletePagesDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    onConfirm: () => void
    pageCount: number
}

export function DeletePagesDialog({ open, onOpenChange, onConfirm, pageCount }: DeletePagesDialogProps) {
    return (
        <AlertDialog open={open} onOpenChange={onOpenChange}>
            <AlertDialogContent className="border-orange-500/20">
                <AlertDialogHeader>
                    <AlertDialogTitle className="text-orange-950 dark:text-orange-50">
                        Supprimer {pageCount > 1 ? "les pages" : "la page"} ?
                    </AlertDialogTitle>
                    <AlertDialogDescription>
                        Vous êtes sur le point de supprimer {pageCount} page{pageCount > 1 ? "s" : ""}.
                        Cette action est irréversible et tout le contenu sera perdu.
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel className="border-orange-200 hover:bg-orange-50 hover:text-orange-900 dark:border-orange-800 dark:hover:bg-orange-900/20 dark:hover:text-orange-50">
                        Annuler
                    </AlertDialogCancel>
                    <AlertDialogAction
                        onClick={(e) => {
                            e.preventDefault();
                            onConfirm();
                        }}
                        className="bg-red-600 hover:bg-red-700 text-white border-red-600 focus:ring-red-600"
                    >
                        Supprimer
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    )
}
