import {
  Button,
  HStack,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  ModalTitle,
} from "@carbon/react";
import { Form, useNavigate, useParams } from "@remix-run/react";
import { path } from "~/utils/path";

const ReceiptPostModal = () => {
  const { receiptId } = useParams();
  if (!receiptId) throw new Error("receiptId not found");

  const navigate = useNavigate();

  const onCancel = () => navigate(-1);

  return (
    <Modal
      open={true}
      onOpenChange={(open) => {
        if (!open) onCancel();
      }}
    >
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>
          <ModalTitle>Post Receipt</ModalTitle>
        </ModalHeader>
        <ModalBody>Are you sure you want to post this receipt?</ModalBody>
        <ModalFooter>
          <HStack>
            <Button variant="solid" onClick={onCancel}>
              Cancel
            </Button>
            <Form action={path.to.receiptPost(receiptId)} method="post">
              <Button type="submit">Post Receipt</Button>
            </Form>
          </HStack>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default ReceiptPostModal;
