import WidgetKit
import Foundation

@objc(WidgetManager)
class WidgetManager: NSObject {
  
  @objc
  func reloadWidget() {
    WidgetCenter.shared.reloadAllTimelines()
  }
  
  @objc
  static func requiresMainQueueSetup() -> Bool {
    return false
  }
}
