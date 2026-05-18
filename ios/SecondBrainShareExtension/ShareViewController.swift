import UIKit
import Social
import UniformTypeIdentifiers

class ShareViewController: SLComposeServiceViewController {
  let appGroup = "group.com.example.secondbrain"

  override func didSelectPost() {
    guard let item = extensionContext?.inputItems.first as? NSExtensionItem,
          let provider = item.attachments?.first else {
      self.extensionContext?.completeRequest(returningItems: [], completionHandler: nil)
      return
    }

    provider.loadItem(forTypeIdentifier: UTType.text.identifier, options: nil) { [weak self] item, _ in
      if let text = item as? String {
        self?.persistSharedWord(text)
      }
      self?.extensionContext?.completeRequest(returningItems: [], completionHandler: nil)
    }
  }

  func persistSharedWord(_ text: String) {
    let defaults = UserDefaults(suiteName: appGroup)
    defaults?.set(text, forKey: "pendingSharedWord")
  }
}
