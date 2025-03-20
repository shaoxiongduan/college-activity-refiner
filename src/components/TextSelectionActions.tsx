"use client"

import React, { useEffect, useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Focus, Scissors } from "lucide-react"

interface TextSelectionActionsProps {
  onEmphasize?: (selectedText: string) => void;
  onMakeConcise?: (selectedText: string) => void;
  containerRef: React.RefObject<HTMLElement>;
}

export function TextSelectionActions({ 
  onEmphasize, 
  onMakeConcise,
  containerRef 
}: TextSelectionActionsProps) {
  const [selectedText, setSelectedText] = useState("");
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isVisible, setIsVisible] = useState(false);
  const popoverRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleSelection = () => {
      const selection = window.getSelection();
      
      if (!selection || selection.toString().trim().length === 0) {
        setIsVisible(false);
        return;
      }
      
      // Check if the selection is within our container
      if (!containerRef.current) {
        return;
      }
      
      // Get the selected text
      const selText = selection.toString().trim();
      
      // Check if the selection is within our container
      const range = selection.getRangeAt(0);
      let selectionWithinContainer = false;
      
      // Check all nodes in the selection range
      const startContainer = range.startContainer;
      const endContainer = range.endContainer;
      
      // Check if the selection container is within our target container
      const isStartNodeInContainer = containerRef.current.contains(startContainer);
      const isEndNodeInContainer = containerRef.current.contains(endContainer);
      
      // The selection is in our container if either start or end is in container
      if (isStartNodeInContainer || isEndNodeInContainer) {
        selectionWithinContainer = true;
      }
      
      // Additionally, check for textarea and input elements which might need special handling
      const activeElement = document.activeElement;
      let isTextAreaSelection = false;
      
      if (activeElement && containerRef.current.contains(activeElement)) {
        if (activeElement instanceof HTMLTextAreaElement || activeElement instanceof HTMLInputElement) {
          selectionWithinContainer = true;
          isTextAreaSelection = true;
        }
      }
      
      if (!selectionWithinContainer) {
        return;
      }
      
      setSelectedText(selText);
      
      // Get position for the popup, handling textarea selections specially
      let posX, posY;
      
      if (isTextAreaSelection && activeElement) {
        // For textarea selections, position near the active element
        const activeRect = activeElement.getBoundingClientRect();
        
        // Position it in the middle of the textarea, slightly above
        posX = activeRect.left + (activeRect.width / 2);
        posY = activeRect.top + (activeRect.height / 3); // Position it 1/3 from the top
      } else {
        // For normal text selections
        const rect = range.getBoundingClientRect();
        posX = rect.left + (rect.width / 2);
        posY = rect.top - 10; // Position it slightly above the selection
      }
      
      setPosition({
        x: posX,
        y: posY
      });
      
      setIsVisible(true);
      
      // Log for debugging
      console.log("Selection detected:", {
        text: selText,
        container: containerRef.current.tagName,
        activeElement: activeElement?.tagName,
        isTextAreaSelection,
        position: { x: posX, y: posY }
      });
    };

    const handleClickOutside = (e: MouseEvent) => {
      if (
        isVisible && 
        popoverRef.current && 
        !popoverRef.current.contains(e.target as Node)
      ) {
        setIsVisible(false);
      }
    };

    // Add event listener for mouseup to detect text selection
    document.addEventListener("mouseup", handleSelection);
    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mouseup", handleSelection);
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isVisible, containerRef]);

  if (!isVisible) return null;

  return (
    <div 
      ref={popoverRef}
      className="selection-actions-popover fixed z-50 bg-background shadow-md rounded-md border flex items-center"
      style={{ 
        left: `${position.x}px`, 
        top: `${position.y}px`,
        transform: 'translate(-50%, -100%)'
      }}
    >
      {onEmphasize && (
        <Button 
          variant="ghost" 
          size="sm" 
          className="px-2 py-1 h-8"
          onClick={() => {
            onEmphasize(selectedText);
            setIsVisible(false);
          }}
          title="Emphasize this text in the refined activity"
        >
          <Focus className="h-4 w-4 mr-1" />
          Emphasize
        </Button>
      )}
      
      {onMakeConcise && (
        <Button 
          variant="ghost" 
          size="sm" 
          className="px-2 py-1 h-8"
          onClick={() => {
            onMakeConcise(selectedText);
            setIsVisible(false);
          }}
          title="Make this text more concise"
        >
          <Scissors className="h-4 w-4 mr-1" />
          Make Concise
        </Button>
      )}
    </div>
  );
} 