import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

const SubmissionDialog = ({ isOpen, onClose, onConfirm, formData, teamInfo, isSubmitting }) => {
  const leader = teamInfo?.members?.[0];
  
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !isSubmitting && onClose(!open)}>
      <DialogContent className="bg-black/90 backdrop-blur-lg border border-white/20 text-white max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold bg-linear-to-r from-white to-white/80 bg-clip-text text-transparent">
            Confirm Submission
          </DialogTitle>
          <DialogDescription className="text-white/70">
            Please review your submission details before confirming.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 my-4">
          {teamInfo && (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <h4 className="text-sm font-medium text-white/70">
                  Team Details
                </h4>
                <p className="text-white mt-1">{teamInfo.teamName || "N/A"}</p>
                <p className="text-white/60 text-xs mt-1">ID: {teamInfo.teamId || teamInfo.id || "N/A"}</p>
              </div>
              <div>
                <h4 className="text-sm font-medium text-white/70">
                  Leader Details
                </h4>
                <p className="text-white mt-1">{leader?.name || "N/A"}</p>
                <p className="text-white/60 text-xs mt-1">{leader?.email || "N/A"}</p>
              </div>
            </div>
          )}

          <div className="space-y-3 mt-4">
            <h4 className="text-sm font-medium text-white/70">Project Links</h4>

            <div className="bg-white/5 p-3 rounded-lg space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-white/70">GitHub</span>
                <a
                  href={formData.githubLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-400 hover:text-blue-300 text-sm truncate max-w-[300px]"
                >
                  {formData.githubLink}
                </a>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-white/70">Presentation</span>
                <a
                  href={formData.pptLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-400 hover:text-blue-300 text-sm truncate max-w-[300px]"
                >
                  {formData.pptLink}
                </a>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-white/70">Video</span>
                <a
                  href={formData.videoLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-400 hover:text-blue-300 text-sm truncate max-w-[300px]"
                >
                  {formData.videoLink}
                </a>
              </div>
            </div>

            <div className="bg-white/5 p-3 rounded-lg">
              <h4 className="text-sm font-medium text-white/70 mb-2">
                Project Description
              </h4>
              <p className="text-white/80 text-sm line-clamp-3">
                {formData.description}
              </p>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={onClose}
            disabled={isSubmitting}
            className="bg-white/10 hover:bg-white/20 text-white border-white/20 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Cancel
          </Button>
          <Button
            onClick={onConfirm}
            disabled={isSubmitting}
            className="bg-linear-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? "Submitting..." : "Confirm & Submit"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default SubmissionDialog;
